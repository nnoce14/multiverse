import clsx from "clsx";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./index.module.css";

const proofLanes = [
  {
    label: "Agent Swarm",
    title: "Domain roles before implementation",
    body: "Coordinator, core, adversarial, and leadership agents keep product truth, boundaries, provider contracts, refusal behavior, and release surface explicit."
  },
  {
    label: "Source Ledger",
    title: "Historical material is scoped evidence",
    body: "The old Multiverse repo and OpenClinXR workflow are reference sources, not automatic truth. Claims move through source and decision records."
  },
  {
    label: "Validation",
    title: "Machine-checkable planning artifacts",
    body: "Schemas validate charters, memory, source records, decisions, scorecards, and generated memory indexes before implementation slices start."
  }
];

const gates = [
  "No provider inference",
  "No managed object inference",
  "Declarative repository configuration only",
  "Refusal before guessing unsafe scope",
  "Core and provider responsibilities stay separate"
];

function ArchitecturePanel() {
  return (
    <div className={styles.architecturePanel} aria-label="Multiverse worktree isolation model">
      <div className={styles.worktreeColumn}>
        <span>worktree-a</span>
        <strong>app runtime</strong>
        <code>primary-db--worktree-a</code>
        <code>http://127.0.0.1:5101</code>
      </div>
      <div className={styles.coreColumn}>
        <span>Multiverse</span>
        <strong>explicit declarations</strong>
        <p>core coordinates providers and refuses unsafe scope</p>
      </div>
      <div className={styles.worktreeColumn}>
        <span>worktree-b</span>
        <strong>app runtime</strong>
        <code>primary-db--worktree-b</code>
        <code>http://127.0.0.1:5102</code>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Evidence-gated local runtime isolation"
      description="Multiverse is a behavior-first tool for deterministic local runtime isolation across parallel git worktrees."
    >
      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Local development isolation</p>
            <Heading as="h1" className={styles.heroTitle}>
              Multiverse
            </Heading>
            <p className={styles.lede}>
              Deterministic runtime context for multiple git worktrees of the same repository,
              governed by source records, decisions, agent review, and executable validation.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary" to="/docs/agent-factory/">
                Agent Swarm
              </Link>
              <Link className="button button--secondary" to="/docs/development/current-state">
                Current State
              </Link>
              <a className="button button--secondary" href="https://github.com/nnoce14/multiverse">
                GitHub
              </a>
            </div>
          </div>
          <ArchitecturePanel />
        </section>

        <section className={styles.band}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Current posture</p>
            <Heading as="h2">A fresh implementation with the workflow foundation laid first.</Heading>
          </div>
          <div className={styles.proofGrid}>
            {proofLanes.map((lane) => (
              <article key={lane.label} className={styles.proofCard}>
                <span>{lane.label}</span>
                <Heading as="h3">{lane.title}</Heading>
                <p>{lane.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={clsx(styles.band, styles.evidenceBand)}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Hard constraints</p>
            <Heading as="h2">The public docs should make refusal and boundaries obvious.</Heading>
          </div>
          <div className={styles.gateList}>
            {gates.map((gate) => (
              <div key={gate}>{gate}</div>
            ))}
          </div>
        </section>

        <section className={styles.band}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Next proof</p>
            <Heading as="h2">Product truth reconstruction comes before the first implementation slice.</Heading>
          </div>
          <p className={styles.statusCopy}>
            The next governed slice should reconstruct the minimum accepted product truth from the
            historical project into fresh decisions, specs, scenarios, and acceptance criteria. Product
            packages, CLI behavior, and provider contracts should appear only when those artifacts point to them.
          </p>
        </section>
      </main>
    </Layout>
  );
}
