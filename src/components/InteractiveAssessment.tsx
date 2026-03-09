import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TeachingDecisionIntervention } from "@/components/TeachingDecisionIntervention";
import { diagnoseTDI, loadTDIRules, logTDIEvent, type TDILoadedRule, type TDIIntervention } from "@/lib/tdi";
import { CheckCircle2, XCircle, Lightbulb, Code, MessageSquare, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type QuestionType = 'mcq' | 'coding' | 'explanation';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  hints: string[];
  explanation: string;
}

interface InteractiveAssessmentProps {
  courseTitle: string;
  moduleTitle: string;
}

export const InteractiveAssessment = ({ courseTitle, moduleTitle }: InteractiveAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [activeIntervention, setActiveIntervention] = useState<TDIIntervention | null>(null);
  const [pendingInterventionForQuestionId, setPendingInterventionForQuestionId] = useState<string | null>(null);

  const isInterrupted = !!activeIntervention;
  const questions: Question[] = [
    {
      id: '1',
      type: 'mcq',
      question: 'What is the primary benefit of using adaptive learning systems?',
      options: [
        'They reduce course creation time',
        'They personalize content to each learner\'s pace and style',
        'They eliminate the need for instructors',
        'They only work with video content'
      ],
      correctAnswer: 'They personalize content to each learner\'s pace and style',
      hints: [
        'Think about what makes AI-powered learning different from traditional courses',
        'Consider how the system adjusts to individual learners',
        'The key word is "personalize"'
      ],
      explanation: 'Adaptive learning systems analyze each learner\'s performance in real-time and adjust content difficulty, pace, and style to match their individual needs. This personalization leads to 50% faster learning and better retention.'
    },
    {
      id: '2',
      type: 'coding',
      question: 'Write a function that calculates the completion percentage given completed lessons and total lessons.',
      hints: [
        'You need to divide completed by total',
        'Don\'t forget to multiply by 100 to get a percentage',
        'Handle the edge case where total might be 0'
      ],
      explanation: 'The function should divide completed lessons by total lessons, multiply by 100, and handle division by zero. A good solution also rounds the result for cleaner display.'
    },
    {
      id: '3',
      type: 'explanation',
      question: 'Explain how AI Teachers adapt difficulty in real-time. What signals do they monitor?',
      hints: [
        'Think about the data an AI Teacher can observe during a lesson',
        'Consider both performance metrics and engagement signals',
        'Time spent on topics is a key indicator'
      ],
      explanation: 'AI Teachers monitor multiple signals: assessment scores, time spent on topics, re-reading patterns, pause frequency, and engagement signals. When a learner struggles (low scores, long time on topic), the AI simplifies explanations, offers hints, and provides encouragement. When a learner excels, it increases difficulty and introduces advanced concepts.'
    }
  ];

  const question = questions[currentQuestion];

  const handleSubmit = () => {
    const correct = question.correctAnswer
      ? userAnswer === question.correctAnswer
      : userAnswer.length > 20; // For explanation questions, just check length

    setIsCorrect(correct);

    if (correct) {
      setShowFeedback(true);
      setScore(score + 1);
      return;
    }

    const intervention = diagnoseTDI({
      mode: "assessment",
      courseTitle,
      topicTitle: moduleTitle,
      question: question.question,
      learnerText: userAnswer,
      correctAnswer: question.correctAnswer,
      metadata: { type: question.type },
    });

    if (intervention) {
      setActiveIntervention(intervention);
      setPendingInterventionForQuestionId(question.id);
      return;
    }

    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer("");
      setShowFeedback(false);
      setHintsUsed(0);
      setActiveIntervention(null);
      setPendingInterventionForQuestionId(null);
    } else {
      setCompleted(true);
    }
  };

  const showHint = () => {
    if (hintsUsed < question.hints.length) {
      setHintsUsed(hintsUsed + 1);
    }
  };

  const getQuestionIcon = (type: QuestionType) => {
    switch (type) {
      case 'mcq': return <CheckSquare className="w-5 h-5" />;
      case 'coding': return <Code className="w-5 h-5" />;
      case 'explanation': return <MessageSquare className="w-5 h-5" />;
    }
  };

  const progress = ((currentQuestion + (showFeedback ? 1 : 0)) / questions.length) * 100;

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <Card className="border-2">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {passed ? (
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-warning mx-auto mb-4" />
            )}
          </motion.div>
          <CardTitle className="text-2xl">
            {passed ? 'Assessment Complete!' : 'Keep Practicing!'}
          </CardTitle>
          <CardDescription>
            You scored {score} out of {questions.length} ({percentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-card border">
            <p className="text-sm text-muted-foreground mb-2">Your Performance</p>
            <Progress value={percentage} className="h-3 mb-2" />
            <p className="text-xs text-muted-foreground">
              {passed 
                ? 'Great job! You\'ve mastered this material.' 
                : 'Review the material and try again to improve your score.'}
            </p>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full">
            {passed ? 'Continue to Next Module' : 'Review & Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TeachingDecisionIntervention
        open={!!activeIntervention}
        intervention={activeIntervention}
        onAcknowledge={() => {
          // Only apply if we're still on the same question
          if (pendingInterventionForQuestionId === question.id) {
            setShowFeedback(true);
          }
          setActiveIntervention(null);
          setPendingInterventionForQuestionId(null);
        }}
        onSkip={() => {
          if (pendingInterventionForQuestionId === question.id) {
            setShowFeedback(true);
          }
          setActiveIntervention(null);
          setPendingInterventionForQuestionId(null);
        }}
      />

      <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="gap-2">
            {getQuestionIcon(question.type)}
            {question.type.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2 mb-4" />
        <CardTitle className="text-xl">{question.question}</CardTitle>
        <CardDescription>
          Choose the best answer or provide your response
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Input */}
          {question.type === 'mcq' && question.options && (
          <RadioGroup value={userAnswer} onValueChange={setUserAnswer} disabled={showFeedback || isInterrupted}>
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    userAnswer === option 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${idx}`} className="mt-1" />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {question.type === 'coding' && (
          <div className="space-y-2">
            <Label>Your Code Solution</Label>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="function calculateProgress(completed, total) {
  // Your code here
}"
              className="font-mono text-sm min-h-[200px]"
              disabled={showFeedback || isInterrupted}
            />
          </div>
        )}

        {question.type === 'explanation' && (
          <div className="space-y-2">
            <Label>Your Explanation</Label>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Explain in your own words..."
              className="min-h-[150px]"
              disabled={showFeedback || isInterrupted}
            />
            <p className="text-xs text-muted-foreground">
              Aim for at least 3-4 sentences for a complete answer
            </p>
          </div>
        )}

        {/* Hints Section */}
        {!showFeedback && !isInterrupted && hintsUsed < question.hints.length && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={showHint}
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Get a Hint ({hintsUsed}/{question.hints.length})
            </Button>
          </div>
        )}

        <AnimatePresence>
          {hintsUsed > 0 && !showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {question.hints.slice(0, hintsUsed).map((hint, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{hint}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Section */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border-2 ${
                isCorrect 
                  ? 'bg-success/5 border-success' 
                  : 'bg-warning/5 border-warning'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                )}
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-lg">
                    {isCorrect ? 'Correct! Well done!' : 'Not quite right'}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {question.explanation}
                  </p>
                  {!isCorrect && !!question.correctAnswer && (
                    <p className="text-sm text-muted-foreground mt-2">
                      The correct answer was:{" "}
                      <span className="font-medium text-foreground">{question.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {!showFeedback ? (
            <Button 
              onClick={handleSubmit} 
              disabled={!userAnswer || isInterrupted}
              className="flex-1 bg-gradient-hero"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="flex-1 bg-gradient-hero"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
            </Button>
          )}
        </div>
      </CardContent>
      </Card>
    </>
  );
};
