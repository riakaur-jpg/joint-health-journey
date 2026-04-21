import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AnswerKey = "routine" | "pain" | "weight" | "exercise" | "footwear" | "stillness" | "warmup";
type RiskLevel = "low" | "moderate" | "high";

const choices: Record<AnswerKey, string[]> = {
  routine: ["Desk job — sitting most of the day", "On my feet most of the day", "Physically demanding work", "Mostly at home"],
  pain: ["Yes, regularly", "Occasionally", "No"],
  weight: ["Healthy range", "Slightly overweight", "Significantly overweight"],
  exercise: ["Daily", "A few times a week", "Rarely or never"],
  footwear: ["Comfortable & supportive", "Heels or flat slip-ons", "Mixed"],
  stillness: ["I move regularly", "1–2 hours at a stretch", "3+ hours without moving"],
  warmup: ["Always", "Sometimes", "Never"],
};

const questions: Record<number, { key: AnswerKey; label: string }[]> = {
  2: [
    { key: "routine", label: "What best describes your daily routine?" },
    { key: "pain", label: "Do you have any existing joint pain?" },
    { key: "weight", label: "How would you describe your body weight?" },
  ],
  3: [
    { key: "exercise", label: "How often do you exercise or stretch?" },
    { key: "footwear", label: "What kind of footwear do you usually wear?" },
    { key: "stillness", label: "How long do you sit or stand without moving?" },
    { key: "warmup", label: "Do you warm up before physical activity?" },
  ],
};

const facts = [
  "Cartilage in your joints has no blood supply — it gets nutrients only through movement",
  "Knee joints bear up to 6x your body weight when you climb stairs",
  "Regular walking is one of the best things you can do for joint longevity",
  "Joint damage from wear and tear is largely preventable with early habit changes",
];

const Index = () => {
  const [screen, setScreen] = useState(1);
  const [answers, setAnswers] = useState<Partial<Record<AnswerKey, string>>>({});
  const [expanded, setExpanded] = useState(false);

  const flags = useMemo(() => {
    const noExercise = answers.exercise === "Rarely or never";
    const longSitting = answers.routine === "Desk job — sitting most of the day" || answers.stillness === "3+ hours without moving";
    const overweight = answers.weight === "Slightly overweight" || answers.weight === "Significantly overweight";
    const footwear = answers.footwear === "Heels or flat slip-ons";
    const warmup = answers.warmup === "Never" || answers.warmup === "Sometimes";
    const physicalWork = answers.routine === "Physically demanding work" && answers.pain !== "No" && Boolean(answers.pain);
    const count = [noExercise, longSitting, overweight, footwear, warmup, physicalWork].filter(Boolean).length;
    const risk: RiskLevel = count <= 1 ? "low" : count <= 3 ? "moderate" : "high";

    return { noExercise, longSitting, overweight, footwear, warmup, physicalWork, count, risk };
  }, [answers]);

  const progress = screen === 5 ? 5 : Math.max(0, screen - 1);
  const canContinue = screen === 2 || screen === 3 ? questions[screen].every((question) => answers[question.key]) : true;

  const chooseAnswer = (key: AnswerKey, value: string) => setAnswers((current) => ({ ...current, [key]: value }));
  const back = () => (screen === 1 ? undefined : setScreen((current) => current - 1));

  return (
    <main className="min-h-screen bg-activity-page">
      <section className="activity-enter mx-auto w-full max-w-[390px] px-7 pb-9 pt-12">
        {screen === 1 && (
          <Button aria-label={screen === 1 ? "Exit activity" : "Previous screen"} variant="activityBack" size="activityBack" className="mb-12" onClick={back}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {screen > 1 && <Progress value={progress} />}

        {screen === 1 && <Welcome onNext={() => setScreen(2)} />}
        {screen === 2 && <QuestionScreen label="ABOUT YOUR DAY" title="Tell us about your day" items={questions[2]} answers={answers} onChoose={chooseAnswer} onNext={() => setScreen(3)} canContinue={canContinue} cta="Next" />}
        {screen === 3 && <QuestionScreen label="YOUR HABITS" title="Your daily habits" items={questions[3]} answers={answers} onChoose={chooseAnswer} onNext={() => setScreen(4)} canContinue={canContinue} cta="See my result" />}
        {screen === 4 && <Result flags={flags} onNext={() => setScreen(5)} />}
        {screen === 5 && <Swaps flags={flags} expanded={expanded} setExpanded={setExpanded} onComplete={() => setScreen(1)} />}
      </section>
    </main>
  );
};

const Progress = ({ value }: { value: number }) => (
  <div className="mb-8 grid grid-cols-5 gap-1" aria-label={`Progress ${value} of 5`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className={cn("h-1 rounded-sm", index < value ? "bg-activity-ink" : "bg-activity-border")} />
    ))}
  </div>
);

const Welcome = ({ onNext }: { onNext: () => void }) => (
  <>
    <p className="mb-3 text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-activity-faint">Orthopedician</p>
    <h1 className="mb-5 text-[32px] font-medium leading-[1.2] text-activity-ink">Joint care &amp; protection</h1>
    <div className="mb-12 space-y-4 text-[15px] leading-[1.7] text-activity-body">
      <p>Your joints carry you through every single day.</p>
      <p>Small daily habits — good or bad — quietly shape how they hold up over time. Let&apos;s see how you&apos;re treating yours.</p>
    </div>
    <p className="mb-4 text-center text-xs leading-none text-activity-muted">Takes about 5 minutes</p>
    <Button variant="activity" size="activity" onClick={onNext}>Check my joint health</Button>
  </>
);

const QuestionScreen = ({ label, title, items, answers, onChoose, onNext, canContinue, cta }: { label: string; title: string; items: { key: AnswerKey; label: string }[]; answers: Partial<Record<AnswerKey, string>>; onChoose: (key: AnswerKey, value: string) => void; onNext: () => void; canContinue: boolean; cta: string }) => (
  <>
    <p className="mb-3 text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-activity-faint">{label}</p>
    <h2 className="mb-5 text-[26px] font-medium leading-[1.3] text-activity-ink">{title}</h2>
    {items.map((item) => (
      <fieldset key={item.key} className="mt-6">
        <legend className="mb-3 text-[13px] leading-none text-activity-faint">{item.label}</legend>
        {choices[item.key].map((choice) => (
          <button key={choice} type="button" onClick={() => onChoose(item.key, choice)} className={cn("activity-option-pop mb-2 w-full rounded-xl border px-4 py-[14px] text-left text-[15px] leading-snug text-activity-ink", answers[item.key] === choice ? "border-activity-ink bg-activity-panel" : "border-activity-border bg-activity-option")}>
            {choice}
          </button>
        ))}
      </fieldset>
    ))}
    <Button variant="activity" size="activity" disabled={!canContinue} onClick={onNext} className="mt-8">{cta}</Button>
  </>
);

const Result = ({ flags, onNext }: { flags: ReturnType<typeof useRiskFlags>; onNext: () => void }) => {
  const copy = {
    low: ["Your joints are well looked after", "Keep it up. Consistency is what protects your joints long term.", "bg-risk-low-bg", "text-risk-low"],
    moderate: ["Some habits need attention", "A few things in your routine are quietly putting stress on your joints.", "bg-risk-moderate-bg", "text-risk-moderate"],
    high: ["Your joints are under stress", "Multiple daily habits are loading your joints more than they should be.", "bg-risk-high-bg", "text-risk-high"],
  }[flags.risk];
  const items = flagItems(flags);

  return (
    <>
      <p className="mb-3 text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-activity-faint">Your result</p>
      <h2 className="mb-5 text-[26px] font-medium leading-[1.3] text-activity-ink">Your joint health snapshot</h2>
      <div className={cn("mb-6 rounded-xl px-4 py-3", copy[2])}>
        <p className={cn("mb-1 text-[15px] font-medium leading-snug", copy[3])}>{copy[0]}</p>
        <p className="text-[13px] leading-[1.55] text-activity-body">{copy[1]}</p>
      </div>
      <p className="mb-[14px] text-[13px] leading-none text-activity-faint">What&apos;s working against you:</p>
      <div className="mb-8">
        {items.length ? items.map((item) => <FlagItem key={item} text={item} low={flags.risk === "low"} />) : <FlagItem text="Your current answers show only light joint stress — keep your movement routine consistent." low />}
      </div>
      <Button variant="activity" size="activity" onClick={onNext}>See what you can do</Button>
    </>
  );
};

const Swaps = ({ flags, expanded, setExpanded, onComplete }: { flags: ReturnType<typeof useRiskFlags>; expanded: boolean; setExpanded: (value: boolean) => void; onComplete: () => void }) => (
  <>
    <p className="mb-3 text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-activity-faint">Start here</p>
    <h2 className="mb-6 text-[26px] font-medium leading-[1.3] text-activity-ink">Protect your joints daily</h2>
    <div className="mb-5">{swapItems(flags).map((item) => <SwapItem key={item} text={item} />)}</div>
    <div className="my-5 h-px bg-activity-border" />
    <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between rounded-t-[10px] bg-activity-know px-4 py-[13px] text-left text-[13px] font-medium leading-none text-activity-ink">
      Did you know?
      <ChevronDown className={cn("h-4 w-4 text-activity-faint transition-transform", expanded && "rotate-180")} />
    </button>
    {expanded && (
      <div className="rounded-b-[10px] bg-activity-option px-4 py-[13px]">
        {facts.map((fact) => <p key={fact} className="mb-2 border-l-2 border-activity-muted pl-[10px] text-xs leading-[1.55] text-activity-body last:mb-0">{fact}</p>)}
      </div>
    )}
    <Button variant="complete" size="activity" className="mt-8" onClick={onComplete}>Complete exercise</Button>
  </>
);

const FlagItem = ({ text, low = false }: { text: string; low?: boolean }) => (
  <div className="mb-3 flex gap-[10px]">
    <span className={cn("mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full", low ? "bg-activity-flag-low" : "bg-activity-flag")} />
    <p className="text-[13px] leading-[1.55] text-activity-copy">{text}</p>
  </div>
);

const SwapItem = ({ text }: { text: string }) => (
  <div className="mb-[14px] flex gap-[10px]">
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-activity-check-bg text-risk-low"><Check className="h-3 w-3" /></span>
    <p className="text-[13px] leading-[1.55] text-activity-copy">{text}</p>
  </div>
);

const flagItems = (flags: ReturnType<typeof useRiskFlags>) => [
  flags.noExercise && "Without regular movement, joints lose lubrication and surrounding muscles weaken",
  flags.longSitting && "Sitting for long stretches compresses your spine and knee joints — movement breaks are essential",
  flags.overweight && "Every extra kg puts roughly 4x the load on your knee joints when walking",
  flags.footwear && "Unsupportive footwear shifts your body's alignment and overloads ankle, knee and hip joints",
  flags.warmup && "Jumping into physical activity without warming up puts sudden stress on cold, stiff joints",
  flags.physicalWork && "Continuing physically demanding work without joint support accelerates wear and tear",
].filter(Boolean) as string[];

const swapItems = (flags: ReturnType<typeof useRiskFlags>) => [
  flags.noExercise && "10 minutes of gentle joint stretching every morning is enough to start",
  flags.longSitting && "Set a reminder to stand and move for 2 minutes every hour — your joints need it",
  flags.warmup && "Always spend 5 minutes warming up before any exercise — even a brisk walk",
  flags.footwear && "Switch to supportive, cushioned footwear for daily use — your knees and ankles will feel it",
  flags.overweight && "Even losing 5kg reduces knee joint load significantly — small steps count",
  flags.physicalWork && "Use joint support braces for demanding tasks and take rest breaks seriously",
  "Swimming and cycling are the most joint-friendly exercises — low impact, high benefit",
].filter(Boolean) as string[];

const useRiskFlags = () => ({
  noExercise: false,
  longSitting: false,
  overweight: false,
  footwear: false,
  warmup: false,
  physicalWork: false,
  count: 0,
  risk: "low" as RiskLevel,
});

export default Index;