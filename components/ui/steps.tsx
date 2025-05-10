import React from "react"
import { cn } from "@/lib/utils"

interface StepsProps {
  currentStep: number
  className?: string
  children: React.ReactNode
}

interface StepProps {
  title: string
  description?: string
}

export function Steps({ currentStep, className, children }: StepsProps) {
  // Count the number of steps
  const steps = React.Children.toArray(children)
  const totalSteps = steps.length

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepProps = (step as React.ReactElement<StepProps>).props
          const isActive = index + 1 === currentStep
          const isCompleted = index + 1 < currentStep
          const isLast = index === totalSteps - 1

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground bg-background text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      "text-xs font-medium",
                      isActive || isCompleted ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {stepProps.title}
                  </div>
                  {stepProps.description && (
                    <div
                      className={cn(
                        "text-xs",
                        isActive || isCompleted ? "text-muted-foreground" : "text-muted-foreground/60",
                      )}
                    >
                      {stepProps.description}
                    </div>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-[2px] w-full max-w-[100px] flex-1",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30",
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export function Step({ title, description }: StepProps) {
  return null
}
