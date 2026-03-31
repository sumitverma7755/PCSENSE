function WizardLayout({ header, children, floatingAction, leftDock }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 pb-28 pt-8 md:px-8 md:pb-36 md:pt-12">
      <div className="saas-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-30" />

      <section className="mx-auto w-full max-w-6xl">
        {header}

        <div className="gradient-shell mt-8 rounded-[28px] p-[1px]">
          <div className="glass-panel wizard-glow rounded-[27px] p-5 md:p-8">{children}</div>
        </div>
      </section>

      {leftDock ? (
        <div className="fixed bottom-5 left-4 z-40 sm:bottom-6 sm:left-6">{leftDock}</div>
      ) : null}

      {floatingAction ? (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-auto sm:right-6">{floatingAction}</div>
      ) : null}
    </main>
  )
}

export default WizardLayout
