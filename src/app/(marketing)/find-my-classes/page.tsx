"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type InterestId =
  | "career"
  | "discipline"
  | "psychology"
  | "risk"
  | "strategy"
  | "community";

type RecommendedClass = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
};

const interests: Array<{ id: InterestId; label: string }> = [
  { id: "career", label: "Develop professional trading skills" },
  { id: "discipline", label: "Build better trading discipline" },
  { id: "psychology", label: "Improve my trading mindset" },
  { id: "risk", label: "Master risk management" },
  { id: "strategy", label: "Learn repeatable strategies" },
  { id: "community", label: "Join a serious trading community" },
];

const goalsByInterest: Record<InterestId, string[]> = {
  career: [
    "Create a roadmap to become consistently profitable",
    "Understand the full-time trader workflow",
    "Build stronger chart-reading confidence",
    "Set measurable trading growth milestones",
  ],
  discipline: [
    "Stop overtrading and revenge trading",
    "Follow a pre-session checklist daily",
    "Execute only high-conviction setups",
    "Track and improve consistency week by week",
  ],
  psychology: [
    "Control emotions during volatile markets",
    "Build confidence after losing streaks",
    "Improve focus and decision quality",
    "Develop a resilient trading mindset",
  ],
  risk: [
    "Apply fixed-risk position sizing",
    "Limit drawdowns before they compound",
    "Use R-multiples to evaluate edge",
    "Design personal loss limits and rules",
  ],
  strategy: [
    "Learn one strategy deeply before scaling",
    "Improve entries and exits using structure",
    "Build a repeatable multi-timeframe process",
    "Backtest and validate setups correctly",
  ],
  community: [
    "Get feedback on my trade ideas",
    "Learn from experienced traders weekly",
    "Stay accountable with a peer group",
    "Access live sessions and Q&A support",
  ],
};

const recommendedByInterest: Record<InterestId, RecommendedClass> = {
  career: {
    title: "Forex Trading Fundamentals",
    subtitle: "Build a complete foundation from setup to execution.",
    href: "/app/courses/1",
    image:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1772728477/workshops/workshop~14636e/fa600f97-6cf2-4759-8641-3093d13591bf-6rrk6b?_a=BAVAZGAQ0",
  },
  discipline: {
    title: "Building Your Trading Plan",
    subtitle: "Turn your strategy into a repeatable operating system.",
    href: "/app/courses/6",
    image:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1770404355/maxresdefault_gtfhoz?_a=BAVAZGAQ0",
  },
  psychology: {
    title: "Trading Psychology Edge",
    subtitle: "Master emotional control and execution discipline.",
    href: "/app/courses/4",
    image:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768990496/workshops/workshop_w8nx7/7719234a-5290-48f9-80e3-5d1a38951698-1j?_a=BAVAZGAQ0",
  },
  risk: {
    title: "Risk Management Mastery",
    subtitle: "Protect your capital and grow with controlled exposure.",
    href: "/app/courses/3",
    image:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768990765/workshops/workshop_ziqgw/7696b4d9-c2fe-4436-a4f6-c4cf83661223-6rrk66?_a=BAVAZGAQ0",
  },
  strategy: {
    title: "Advanced Price Action Analysis",
    subtitle: "Read market structure and execute with precision.",
    href: "/app/courses/2",
    image:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768309978/workshops/workshop_6lw0i/57a97191-e92c-442d-a56d-218542c56c95-lr3qgo?_a=BAVAZGAQ0",
  },
  community: {
    title: "ICT Concepts Simplified",
    subtitle: "Align with structured concepts and shared learning flow.",
    href: "/app/courses/5",
    image:
      "https://res.cloudinary.com/dezn0ffbx/image/upload/c_limit,w_1920/f_auto/q_auto/v1768989921/workshops/workshop_ja7rw/echo?_a=BAVAZGAQ0",
  },
};

const steps = ["Interests", "Goals", "Classes For You"] as const;

function toggleInArray(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export default function FindMyClassesPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<InterestId[]>([]);
  const [goalSelections, setGoalSelections] = useState<Record<InterestId, string[]>>({} as Record<InterestId, string[]>);
  const [interestStepIndex, setInterestStepIndex] = useState(0);

  const activeInterest = selectedInterests[interestStepIndex];
  const selectedGoalsForActiveInterest = activeInterest ? goalSelections[activeInterest] ?? [] : [];

  const recommendedClasses = useMemo(() => {
    const source: InterestId[] = selectedInterests.length > 0 ? selectedInterests : ["career"];
    return source.map((interest) => recommendedByInterest[interest]).slice(0, 3);
  }, [selectedInterests]);

  const signupUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("source", "onboarding");
    params.set("interests", selectedInterests.join(","));

    const flattenedGoals = selectedInterests.flatMap((interest) => goalSelections[interest] ?? []);
    params.set("goals", flattenedGoals.join("|"));
    return `https://app.kcmtrades.com/signup?${params.toString()}`;
  }, [selectedInterests, goalSelections]);

  const canContinue =
    stepIndex === 0
      ? selectedInterests.length > 0
      : stepIndex === 1
        ? selectedGoalsForActiveInterest.length > 0
        : true;

  const handleContinue = () => {
    if (stepIndex === 0) {
      setStepIndex(1);
      setInterestStepIndex(0);
      return;
    }

    if (stepIndex === 1) {
      if (interestStepIndex < selectedInterests.length - 1) {
        setInterestStepIndex((value) => value + 1);
        return;
      }

      setStepIndex(2);
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      return;
    }

    if (stepIndex === 1) {
      if (interestStepIndex > 0) {
        setInterestStepIndex((value) => value - 1);
      } else {
        setStepIndex(0);
      }
      return;
    }

    if (stepIndex === 2) {
      setStepIndex(1);
      setInterestStepIndex(Math.max(0, selectedInterests.length - 1));
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f6f7]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            KCM Trades
          </Link>
          <span className="text-sm text-muted-foreground">Onboarding</span>
        </div>

        <div className="rounded-xl border bg-card p-5 sm:p-7">
          <div className="mb-6 grid grid-cols-3 gap-2">
            {steps.map((step, index) => (
              <div key={step} className="space-y-2">
                <div className={`h-1.5 rounded-full ${index <= stepIndex ? "bg-primary" : "bg-muted"}`} />
                <p className={`text-xs font-medium ${index <= stepIndex ? "text-foreground" : "text-muted-foreground"}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          {stepIndex === 0 ? (
            <section className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight">What brings you to KCM Trades today?</h1>
              <p className="text-muted-foreground">
                Choose at least one so we can tailor your classes and study path.
              </p>

              <div className="space-y-2">
                {interests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => setSelectedInterests((current) => toggleInArray(current, interest.id) as InterestId[])}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60"
                      }`}
                    >
                      <span className="text-sm sm:text-base">{interest.label}</span>
                      <span
                        className={`ml-3 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-xs ${
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {stepIndex === 1 && activeInterest ? (
            <section className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight">
                Which goals matter most for {interests.find((interest) => interest.id === activeInterest)?.label.toLowerCase()}?
              </h1>
              <p className="text-muted-foreground">
                Select at least one goal for this interest.
              </p>

              <div className="space-y-2">
                {goalsByInterest[activeInterest].map((goal) => {
                  const isSelected = selectedGoalsForActiveInterest.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() =>
                        setGoalSelections((current) => ({
                          ...current,
                          [activeInterest]: toggleInArray(current[activeInterest] ?? [], goal),
                        }))
                      }
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60"
                      }`}
                    >
                      <span className="text-sm sm:text-base">{goal}</span>
                      <span
                        className={`ml-3 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-xs ${
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {stepIndex === 2 ? (
            <section className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">DID YOU KNOW?</p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Every membership includes access to all core courses and new releases.
              </h1>
              <p className="text-muted-foreground">
                Based on your answers, here are classes we recommend first:
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {recommendedClasses.map((course) => (
                  <Link
                    key={course.title}
                    href={course.href}
                    className="overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <img src={course.image} alt={course.title} className="aspect-video w-full object-cover" />
                    <div className="space-y-1 p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold">{course.title}</h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{course.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">You can update your preferences later inside your account.</p>
            </section>
          ) : null}

          <div className="mt-7 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors ${
                stepIndex === 0 ? "pointer-events-none opacity-40" : "hover:bg-muted"
              }`}
            >
              Back
            </button>

            {stepIndex < 2 ? (
              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue}
                className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors ${
                  canContinue
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                }`}
              >
                Continue
              </button>
            ) : (
              <Link
                href={signupUrl}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Continue to Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
