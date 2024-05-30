import { FlySafe } from '@rbxroot/src/StarterPlayer/StarterPlayerScripts/Gui/components/FlySafe'

import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Welcome to <code className={styles.code}>Survive Arcade</code>
        </p>
        <div>
          <a
            href="https://www.greenappers.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            By GreenAppers
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <FlySafe />
      </div>

      <div className={styles.grid}>
        <a
          href="https://ro.blox.com/Ebh5?af_dp=roblox%3A%2F%2FplaceId%3D15699266223%26launchData%3Dutm1%25253A0%25252C0%25252Cweb-link%25252Chome-hero-play-button%25252C%25253B&af_web_dp=https%3A%2F%2Fwww.roblox.com%2Fgames%2Fstart%3FplaceId%3D15699266223%26launchData%3Dutm1%25253A0%25252C0%25252Cweb-link%25252Chome-hero-play-button%25252C%25253B"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Play <span>-&gt;</span>
          </h2>
          <p>Join the experience (Beta).</p>
        </a>

        <a
          href="https://www.roblox.com/games/15699266223/Survive-Arcade-DEV"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Visit <span>-&gt;</span>
          </h2>
          <p>Visit the Place that it all started!</p>
        </a>

        <a
          href="https://www.roblox.com/users/5353131856/profile/#!/creations"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Group <span>-&gt;</span>
          </h2>
          <p>Join the group and explore more creations.</p>
        </a>

        <a
          href="https://x.com/greenappers"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Social <span>-&gt;</span>
          </h2>
          <p>Follow for promo codes!</p>
        </a>
      </div>
    </main>
  )
}
