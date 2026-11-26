import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AqiBadge, getAqiColorClass } from "../src/components/AqiBadge";
import { ImpactCard } from "../src/components/ImpactCard";
import { PlanDisplay } from "../src/components/PlanDisplay";
import { ApiKeyPanel } from "../src/components/ApiKeyPanel";
import { HouseholdProfileForm } from "../src/components/HouseholdProfileForm";
import { getActionById } from "../src/lib/catalog";
import type { AirQualityData } from "../src/lib/aqi";
import type { ImpactResult } from "../src/lib/impact";

describe("ui: AqiBadge color styling & accessible rendering", () => {
  it("maps Good category to green styling", () => {
    expect(getAqiColorClass("Good")).toContain("emerald");
  });

  it("maps Hazardous and severe AQI to red/rose styling", () => {
    expect(getAqiColorClass("Hazardous")).toContain("rose");
  });

  it("maps Unhealthy to orange/amber styling", () => {
    expect(getAqiColorClass("Unhealthy")).toContain("orange");
  });

  it("maps Moderate, Sensitive Groups, and VeryUnhealthy breakpoints cleanly", () => {
    expect(getAqiColorClass("Moderate")).toContain("yellow");
    expect(getAqiColorClass("UnhealthyForSensitiveGroups")).toContain("amber");
    expect(getAqiColorClass("VeryUnhealthy")).toContain("purple");
  });

  it("renders severe hazard medical alert banner cleanly with ARIA alert role", () => {
    const severeAir: AirQualityData = {
      aqi: 410,
      pm25: 320.5,
      category: "Hazardous",
      source: "google",
      location: { latitude: 28.61, longitude: 77.2, displayName: "Delhi, India" },
      isSevereHazard: true,
      medicalEscalation: "Stay indoors immediately.",
      fetchedAt: "2026-11-26T00:00:00Z",
    };

    const html = renderToStaticMarkup(React.createElement(AqiBadge, { air: severeAir }));
    expect(html).toContain('role="alert"');
    expect(html).toContain("Severe Hazardous Smog Warning");
    expect(html).toContain("Google Maps Air Quality API");
    expect(html).toContain("410");
  });
});

describe("ui: ImpactCard, PlanDisplay, and Form Accessibility Markup", () => {
  it("renders ImpactCard progressbar with ARIA attributes and metrics", () => {
    const sampleImpact: ImpactResult = {
      baselineExposurePM25: 180,
      mitigatedExposurePM25: 54,
      reductionPercentage: 70,
      baselineCigaretteEquivalents: 8.2,
      mitigatedCigaretteEquivalents: 2.5,
      cigarettesSavedPerDay: 5.7,
      annualCigarettesAvoided: 2081,
      co2SavedKgPerMonth: 18,
      caveat: "Approximate rule-of-thumb estimate.",
      breakdown: {
        outdoorReductionFraction: 0.6,
        indoorReductionFraction: 0.5,
        cookingReductionFraction: 0,
      },
    };

    const html = renderToStaticMarkup(React.createElement(ImpactCard, { impact: sampleImpact }));
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="30"');
    expect(html).toContain("-70%");
    expect(html).toContain("5.7");
  });

  it("renders PlanDisplay summary, daily protocol tips, and curated action cards", () => {
    const html = renderToStaticMarkup(
      React.createElement(PlanDisplay, {
        summary: "Close bedroom windows at night.",
        dailyRoutineTips: ["Wear N95 outside", "Run HEPA purifier"],
        actions: [getActionById("n95_mask_commute")!],
      })
    );
    expect(html).toContain("Close bedroom windows at night.");
    expect(html).toContain("Wear N95/FFP2 Mask During Commute");
    expect(html).toContain("-60% PM2.5");
  });

  it("renders ApiKeyPanel and HouseholdProfileForm with labeled inputs and ARIA groups", () => {
    const keyHtml = renderToStaticMarkup(
      React.createElement(ApiKeyPanel, {
        apiKey: "",
        showKey: false,
        rememberKey: true,
        onKeyChange: () => {},
        onToggleShowKey: () => {},
        onToggleRemember: () => {},
      })
    );
    expect(keyHtml).toContain('for="apiKey"');
    expect(keyHtml).toContain('aria-label="Show Gemini API key"');
    expect(keyHtml).toContain('for="rememberKey"');

    const formHtml = renderToStaticMarkup(
      React.createElement(HouseholdProfileForm, {
        form: {
          city: "Delhi",
          homeType: "standard",
          cookingFuel: "lpg_electric",
          commuteMode: "carpool_transit",
          budget: "low",
          outdoorHours: 2,
          hasExistingPurifier: false,
          notes: "",
        },
        loading: false,
        gpsLoading: false,
        onUpdateField: () => {},
        onCityInputChange: () => {},
        onUseGps: () => {},
        onSubmit: () => {},
      })
    );
    expect(formHtml).toContain('for="cityInput"');
    expect(formHtml).toContain('role="group"');
    expect(formHtml).toContain('aria-pressed="true"');
    expect(formHtml).toContain('for="outdoorHoursSlider"');
    expect(formHtml).toContain("Intervention Budget Tier");
  });
});
