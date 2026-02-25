import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Phone, Navigation, Package, CheckCircle2, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────
// LEAFLET + OPENSTREETMAP SETUP
// Leaflet is loaded from CDN via useEffect so no npm install needed.
// This keeps the component self-contained — just drop it into the
// project and it works.
// ─────────────────────────────────────────────────────────────────

// Real Lagos/Ikeja coordinates for the simulation route.
// These trace a realistic road path through Ikeja, Lagos.
// Format: [latitude, longitude]
const SIMULATION_ROUTE = [
  [6.6018, 3.3515],   // Start: Oshodi
  [6.6045, 3.3489],   // Along Agege Motor Road
  [6.6078, 3.3462],
  [6.6112, 3.3438],
  [6.6145, 3.3410],   // Passing Ikeja Along
  [6.6178, 3.3385],
  [6.6205, 3.3360],
  [6.6230, 3.3340],
  [6.6258, 3.3318],
  [6.6280, 3.3300],   // Approaching Allen Avenue
  [6.6300, 3.3282],
  [6.6318, 3.3265],
  [6.6335, 3.3250],   // End: Ikeja GRA destination
];

// The two "other SME" drop-off markers visible on the map
const SME_MARKERS = [
  { coords: [6.6160, 3.3420], label: "SME #1 Drop-off" },
  { coords: [6.6250, 3.3330], label: "SME #2 Drop-off" },
];

const trackingSteps = [
  { label: "Order Placed",      time: "9:00 AM",  done: true  },
  { label: "Orders Paired",     time: "9:05 AM",  done: true  },
  { label: "Payment Confirmed", time: "9:08 AM",  done: true  },
  { label: "Picked Up",         time: "9:30 AM",  done: true  },
  { label: "In Transit",        time: "10:15 AM", done: false, active: true },
  { label: "Delivered",         time: "",         done: false },
];

// ─────────────────────────────────────────────────────────────────
// HELPER: Inject Leaflet CSS + JS from CDN into the page's <head>
// only once, then resolve a promise when ready.
// ─────────────────────────────────────────────────────────────────
let leafletReady = null;

function loadLeaflet() {
  if (leafletReady) return leafletReady;

  leafletReady = new Promise((resolve) => {
    // Check if already loaded
    if ((window as any).L) { resolve((window as any).L); return; }

    // Inject CSS
    const css = document.createElement("link");
    css.rel  = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);

    // Inject JS
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => resolve((window as any).L);
    document.head.appendChild(script);
  });

  return leafletReady;
}

// ─────────────────────────────────────────────────────────────────
// LIVE MAP COMPONENT
// Encapsulated so the map lifecycle is clean and isolated.
// ─────────────────────────────────────────────────────────────────
const LiveMap = ({ onEtaUpdate }) => {
  const mapContainer = useRef(null);
  const mapInstance  = useRef(null);
  const riderMarker  = useRef(null);
  const routeLine    = useRef(null);
  const stepIndex    = useRef(0);
  const animInterval = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet().then((L) => {
      if (cancelled || !mapContainer.current || mapInstance.current) return;

      // ── Init map centered on mid-point of the route ──────────
      const map = L.map(mapContainer.current, {
        center: [6.6180, 3.3390],
        zoom: 14,
        zoomControl: false,         // hide default zoom buttons (cleaner mobile UI)
        attributionControl: false,  // hide attribution for cleaner look
      });

      mapInstance.current = map;

      // ── OpenStreetMap tile layer ─────────────────────────────
      // Using the standard OSM tile server — no API key required.
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // ── Custom green rider marker (SVG inline) ───────────────
      const riderIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 42px; height: 42px;
            background: #166534;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 0 4px rgba(22,101,52,0.25), 0 3px 10px rgba(0,0,0,0.3);
          ">
            <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'
                 viewBox='0 0 24 24' fill='none' stroke='white'
                 stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
              <polygon points='3 11 22 2 13 21 11 13 3 11'/>
            </svg>
          </div>`,
        iconSize:   [42, 42],
        iconAnchor: [21, 21],
      });

      // ── Destination marker (orange dot) ──────────────────────
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 16px; height: 16px;
          background: #f97316;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        "></div>`,
        iconSize:   [16, 16],
        iconAnchor: [8, 8],
      });

      // ── SME drop-off markers (small green dots) ───────────────
      const smeIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 12px; height: 12px;
          background: #4ade80;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize:   [12, 12],
        iconAnchor: [6, 6],
      });

      // Place destination marker at end of route
      const destination = SIMULATION_ROUTE[SIMULATION_ROUTE.length - 1];
      L.marker(destination, { icon: destIcon })
        .addTo(map)
        .bindPopup("<b>Your drop-off</b><br>Ikeja GRA");

      // Place SME markers
      SME_MARKERS.forEach(({ coords, label }) => {
        L.marker(coords, { icon: smeIcon })
          .addTo(map)
          .bindPopup(label);
      });

      // Draw the full planned route as a light dashed polyline
      routeLine.current = L.polyline(SIMULATION_ROUTE, {
        color: "#166534",
        weight: 3,
        opacity: 0.35,
        dashArray: "6 8",
      }).addTo(map);

      // Place rider marker at start
      riderMarker.current = L.marker(SIMULATION_ROUTE[0], { icon: riderIcon })
        .addTo(map)
        .bindPopup("<b>Musa Kabiru</b><br>Toyota HiAce");

      // Draw the "travelled" portion of route in solid green
      const travelledLine = L.polyline([SIMULATION_ROUTE[0]], {
        color: "#166534",
        weight: 4,
        opacity: 0.85,
      }).addTo(map);

      // ── Animate rider along the route ─────────────────────────
      // Moves one coordinate step every 2 seconds.
      animInterval.current = setInterval(() => {
        stepIndex.current += 1;

        if (stepIndex.current >= SIMULATION_ROUTE.length) {
          // Reached destination — stop animation
          clearInterval(animInterval.current);
          onEtaUpdate("Arrived");
          return;
        }

        const newPos = SIMULATION_ROUTE[stepIndex.current];
        riderMarker.current.setLatLng(newPos);
        map.panTo(newPos, { animate: true, duration: 1.5 });

        // Extend the travelled polyline
        travelledLine.addLatLng(newPos);

        // Update ETA countdown
        const remaining = SIMULATION_ROUTE.length - 1 - stepIndex.current;
        const etaMins   = Math.max(0, Math.round(remaining * 1.5)); // ~1.5 min per step
        onEtaUpdate(etaMins > 0 ? `${etaMins} minutes` : "Arriving now");

      }, 2000); // move every 2 seconds
    });

    return () => {
      cancelled = true;
      clearInterval(animInterval.current);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────
const TrackOrder = () => {
  const navigate = useNavigate();
  const [eta, setEta] = useState("20 minutes");

  return (
    <div className="animate-slide-up">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Track Order</h1>
        <span className="ml-auto text-xs font-mono text-muted-foreground">ORD-2847</span>
      </div>

      {/* ── Live Map ────────────────────────────────────────────── */}
      {/*
        The map container sits inside a rounded div exactly like the
        original placeholder, so nothing else in the layout changes.
        Height is h-52 (208px) to match the original screenshot.
      */}
      <div className="mx-4 rounded-2xl overflow-hidden border border-border h-52 relative">

        {/* ETA overlay — floats over the map, top-center */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,              // must be above Leaflet tiles (z-index ~400)
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
              borderRadius: 99,
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              border: "1px solid rgba(22,101,52,0.2)",
            }}
          >
            <Navigation
              style={{ width: 13, height: 13, color: "#166534" }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#166534",
                whiteSpace: "nowrap",
              }}
            >
              {eta === "Arrived" ? "Driver has arrived!" : `ETA: ${eta}`}
            </span>
          </div>
        </div>

        {/* The actual Leaflet map */}
        <LiveMap onEtaUpdate={setEta} />
      </div>

      {/* ── Driver info ─────────────────────────────────────────── */}
      <div className="mx-4 mt-4 bg-card rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          MK
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Musa Kabiru</p>
          <p className="text-xs text-muted-foreground">Toyota HiAce • LAG-234-XY</p>
        </div>
        <button className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
          <Phone className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* ── Pooled delivery banner ──────────────────────────────── */}
      <div className="mx-4 mt-3 gradient-eco rounded-xl p-3 flex items-center gap-2">
        <Package className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-xs text-accent-foreground">
          This delivery is shared with <strong>2 other SMEs</strong> heading to Ikeja area
        </p>
      </div>

      {/* ── Delivery Progress timeline ──────────────────────────── */}
      <div className="mx-4 mt-5 mb-6">
        <h2 className="text-sm font-bold text-foreground mb-3">Delivery Progress</h2>
        <div className="space-y-0">
          {trackingSteps.map((step, i) => (
            <div key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : step.active ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20 flex-shrink-0 animate-pulse" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
                )}
                {i < trackingSteps.length - 1 && (
                  <div className={`w-0.5 h-8 ${step.done ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-6">
                <p className={`text-sm ${step.done || step.active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
                {step.time && (
                  <p className="text-xs text-muted-foreground">{step.time}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TrackOrder;