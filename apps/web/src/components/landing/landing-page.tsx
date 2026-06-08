'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from '@/lib/i18n/use-translations'
import { LanguageToggle } from './language-toggle'
import './landing.css'

export default function LandingPage() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const t = useTranslations()
  const { locale } = useLocale()

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIdx((prev) => (prev + 1) % 3)
    }, 4800)
    return () => clearInterval(interval)
  }, [])

  // Locale-aware scene labels
  const sceneLabels = {
    en: ['Overview', 'Pull Requests', 'Scorecards'],
    pt: ['Visão geral', 'Pull Requests', 'Scorecards'],
  }

  return (
    <>
      {/* NAV */}
      <nav className="top">
        <div className="inner">
          <Link href="/" className="logo">
            <span className="logo-mark"></span>
            <span className="logo-word">Spravio</span>
          </Link>
          <ul>
            <li>
              <a href="#features">{t('nav.features')}</a>
            </li>
            <li>
              <a href="#how">{t('nav.how')}</a>
            </li>
            <li>
              <a href="#pricing">{t('nav.pricing')}</a>
            </li>
            <li>
              <a href="#faq">{t('nav.faq')}</a>
            </li>
          </ul>
          <LanguageToggle />
          <div className="nav-actions">
            <Link href="/login" className="btn ghost">
              {t('nav.signin')}
            </Link>
            <Link href="/register" className="btn primary">
              {t('nav.cta')} <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero" id="top">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="pill">
                <span className="dot">●</span>
                <span>{t('hero.pill')}</span>
              </div>
              <h1
                className="display"
                dangerouslySetInnerHTML={{ __html: t('hero.h1') }}
              />
              <p className="sub">{t('hero.sub')}</p>
              <div className="hero-cta">
                <Link href="/register" className="btn primary">
                  {t('hero.cta1')} <span className="arr">→</span>
                </Link>
                <a href="#how" className="btn outline">
                  {t('hero.cta2')}
                </a>
              </div>
              <div className="hero-meta">
                <span>
                  ✦ <span>{t('hero.meta1')}</span>
                </span>
                <span>{t('hero.meta2')}</span>
                <span>{t('hero.meta3')}</span>
              </div>
            </div>

            {/* PRODUCT FRAME */}
            <div className="product-frame">
              <div className="browser-chrome">
                <div className="dots">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className="url">app.spravio.io / portfolio</div>
              </div>
              <div className="product-stage">
                <div className="scene-label">
                  <span className="lv"></span>
                  <span>{sceneLabels[locale][sceneIdx]}</span>
                </div>

                {/* Scene 1: Overview */}
                <div className={`scene ${sceneIdx === 0 ? 'active' : ''}`}>
                  <div className="sidebar">
                    <div className="sb-title">{t('hero.sidebar')}</div>
                    <div className="prj on">
                      <span className="sw"></span>Banco Meridian
                      <span className="st">92%</span>
                    </div>
                    <div className="prj">
                      <span className="sw"></span>E-comm Vora
                      <span className="st">78%</span>
                    </div>
                    <div className="prj">
                      <span className="sw"></span>Portal RH Nex
                      <span className="st">54%</span>
                    </div>
                    <div className="prj">
                      <span className="sw"></span>App Kaia Pay
                      <span className="st">31%</span>
                    </div>
                  </div>
                  <div className="scene-main">
                    <div className="kpi-row">
                      <div className="kpi">
                        <div className="k-label">Cards</div>
                        <div className="k-value">115</div>
                        <div className="k-delta">+12 wk</div>
                      </div>
                      <div className="kpi">
                        <div className="k-label">Done</div>
                        <div className="k-value">67</div>
                        <div className="k-delta">58%</div>
                      </div>
                      <div className="kpi">
                        <div className="k-label">Open PRs</div>
                        <div className="k-value">4</div>
                        <div className="k-delta" style={{ color: 'var(--warn)' }}>
                          2 stale
                        </div>
                      </div>
                      <div className="kpi">
                        <div className="k-label">Cycle</div>
                        <div className="k-value">
                          22<span className="suf">h</span>
                        </div>
                        <div className="k-delta">-3h</div>
                      </div>
                    </div>
                    <div className="chart-card">
                      <div className="chart-head">
                        <div className="title">{t('hero.burndown')}</div>
                        <div className="tag">● NO PRAZO</div>
                      </div>
                      <svg
                        className="chart-svg"
                        viewBox="0 0 400 130"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="fill1" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <line
                          x1="0"
                          y1="10"
                          x2="400"
                          y2="120"
                          stroke="currentColor"
                          strokeDasharray="3 4"
                          strokeOpacity="0.3"
                        />
                        <path
                          d="M 0 10 L 50 22 L 100 30 L 150 48 L 200 60 L 250 78 L 300 88 L 350 98 L 400 110"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ color: 'var(--accent-deep)' }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M 0 10 L 50 22 L 100 30 L 150 48 L 200 60 L 250 78 L 300 88 L 350 98 L 400 110 L 400 130 L 0 130 Z"
                          fill="url(#fill1)"
                          style={{ color: 'var(--accent-deep)' }}
                        />
                        <circle
                          cx="200"
                          cy="60"
                          r="4"
                          fill="var(--accent)"
                          stroke="var(--paper)"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Scene 2: PRs */}
                <div className={`scene ${sceneIdx === 1 ? 'active' : ''}`}>
                  <div className="sidebar">
                    <div className="sb-title">Filters</div>
                    <div className="prj on">
                      <span className="sw"></span>All PRs<span className="st">12</span>
                    </div>
                    <div className="prj">
                      <span className="sw" style={{ background: 'var(--warn)' }}></span>Stale 24h
                      <span className="st">2</span>
                    </div>
                    <div className="prj">
                      <span className="sw" style={{ background: 'var(--bad)' }}></span>Stale 72h
                      <span className="st">1</span>
                    </div>
                    <div className="prj">
                      <span className="sw" style={{ background: 'var(--good)' }}></span>Merged
                      <span className="st">9</span>
                    </div>
                  </div>
                  <div className="scene-main">
                    <div className="pr-list">
                      <div className="pr-card">
                        <div className="pr-ico">✓</div>
                        <div className="pr-title">feat(auth): OAuth token refresh</div>
                        <div className="pr-meta">LF · #PRJ-204</div>
                        <div className="pr-age">4h</div>
                      </div>
                      <div className="pr-card">
                        <div className="pr-ico">✓</div>
                        <div className="pr-title">fix(billing): currency rounding</div>
                        <div className="pr-meta">MS · #PRJ-198</div>
                        <div className="pr-age">8h</div>
                      </div>
                      <div className="pr-card stale">
                        <div className="pr-ico">!</div>
                        <div className="pr-title">refactor(api): payment service</div>
                        <div className="pr-meta">PA · #PRJ-187</div>
                        <div className="pr-age">28h</div>
                      </div>
                      <div className="pr-card critical">
                        <div className="pr-ico">!</div>
                        <div className="pr-title">feat(reports): quarterly PDF</div>
                        <div className="pr-meta">AC · #PRJ-172</div>
                        <div className="pr-age">76h</div>
                      </div>
                      <div className="pr-card">
                        <div className="pr-ico">✓</div>
                        <div className="pr-title">chore(deps): bump next to 14.2</div>
                        <div className="pr-meta">LF · #PRJ-165</div>
                        <div className="pr-age">11h</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scene 3: Scorecards */}
                <div className={`scene ${sceneIdx === 2 ? 'active' : ''}`}>
                  <div className="sidebar">
                    <div className="sb-title">Team</div>
                    <div className="prj on">
                      <span className="sw"></span>All (8)
                    </div>
                    <div className="prj">
                      <span className="sw"></span>Senior (3)
                    </div>
                    <div className="prj">
                      <span className="sw"></span>Pleno (4)
                    </div>
                    <div className="prj">
                      <span className="sw"></span>Junior (1)
                    </div>
                  </div>
                  <div className="scene-main">
                    <div className="sc-grid">
                      {[
                        { name: 'LF', full: 'Luiza Ferreira', role: 'Senior', score: 4.2, perc: 84 },
                        { name: 'MS', full: 'Marcelo Santos', role: 'Pleno', score: 3.8, perc: 76 },
                        { name: 'PA', full: 'Paula Alves', role: 'Senior', score: 4.5, perc: 90 },
                        { name: 'AC', full: 'André Costa', role: 'Junior', score: 3.2, perc: 64 },
                      ].map((dev, i) => (
                        <div key={i} className="sc">
                          <div className="av">{dev.name}</div>
                          <div>
                            <div className="nm">{dev.full}</div>
                            <div className="rl">{dev.role}</div>
                          </div>
                          <div className="score">
                            {dev.score}
                            <small>/ 5</small>
                          </div>
                          <div className="bar">
                            <i style={{ width: `${dev.perc}%` }}></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scene nav */}
                <div className="scene-nav">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      className={sceneIdx === i ? 'on' : ''}
                      onClick={() => setSceneIdx(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* INTEGRATIONS */}
          <div className="integrations">
            <div className="integrations-inner">
              <div className="lbl">{t('hero.integ')}</div>
              <div className="integ-logos">
                <span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-label="Jira">
                    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z" />
                  </svg>
                  Jira
                </span>
                <span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-label="GitHub">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  GitHub
                </span>
                <span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-label="Azure DevOps">
                    <path d="M0 8.877L2.247 5.91l8.405-3.416V.022l7.37 5.393L2.966 8.338v8.225L0 15.707zm24-4.45v14.651l-5.753 4.9-9.303-3.057v3.056l-5.978-7.416 16.812 1.305V5.415z" />
                  </svg>
                  Azure DevOps
                </span>
                <span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-label="Slack">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                  </svg>
                  Slack
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="block" id="features">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{t('features.eyebrow')}</span>
            <h2
              className="display"
              dangerouslySetInnerHTML={{ __html: t('features.h2') }}
            />
            <p className="sub">{t('features.sub')}</p>
          </div>

          <div className="features-grid">
            <div className="feature big">
              <div className="f-num">01</div>
              <div className="f-title">{t('f1.t')}</div>
              <div className="f-desc">{t('f1.d')}</div>
              <div className="f-visual">
                <div className="fv-bar">
                  <i></i>
                </div>
              </div>
            </div>

            <div className="feature big">
              <div className="f-num">02</div>
              <div className="f-title">{t('f2.t')}</div>
              <div className="f-desc">{t('f2.d')}</div>
              <div className="f-visual">
                <div className="fv-rings">
                  <div className="fv-ring">
                    <svg width="54" height="54">
                      <circle
                        cx="27"
                        cy="27"
                        r="22"
                        fill="none"
                        stroke="var(--cream-3)"
                        strokeWidth="5"
                      />
                      <circle
                        cx="27"
                        cy="27"
                        r="22"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="5"
                        strokeDasharray="140"
                        strokeDashoffset="30"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="c">4.2</div>
                  </div>
                  <div className="fv-ring">
                    <svg width="54" height="54">
                      <circle
                        cx="27"
                        cy="27"
                        r="22"
                        fill="none"
                        stroke="var(--cream-3)"
                        strokeWidth="5"
                      />
                      <circle
                        cx="27"
                        cy="27"
                        r="22"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="5"
                        strokeDasharray="140"
                        strokeDashoffset="50"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="c">3.6</div>
                  </div>
                  <div className="fv-ring">
                    <svg width="54" height="54">
                      <circle
                        cx="27"
                        cy="27"
                        r="22"
                        fill="none"
                        stroke="var(--cream-3)"
                        strokeWidth="5"
                      />
                      <circle
                        cx="27"
                        cy="27"
                        r="22"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="5"
                        strokeDasharray="140"
                        strokeDashoffset="15"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="c">4.8</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature med">
              <div className="f-num">03</div>
              <div className="f-title">{t('f3.t')}</div>
              <div className="f-desc">{t('f3.d')}</div>
              <div className="f-visual">
                <div className="fv-prs">
                  <div>
                    <span className="dot" style={{ background: 'var(--good)' }}></span>feat:
                    checkout v2 (4h)
                  </div>
                  <div>
                    <span className="dot" style={{ background: 'var(--warn)' }}></span>fix: cart
                    bug (26h)
                  </div>
                  <div>
                    <span className="dot" style={{ background: 'var(--bad)' }}></span>refactor:
                    api (73h)
                  </div>
                </div>
              </div>
            </div>

            <div className="feature med">
              <div className="f-num">04</div>
              <div className="f-title">{t('f4.t')}</div>
              <div className="f-desc">{t('f4.d')}</div>
            </div>

            <div className="feature med">
              <div className="f-num">05</div>
              <div className="f-title">{t('f5.t')}</div>
              <div className="f-desc">{t('f5.d')}</div>
              <div className="f-tag">{t('f5.tag')}</div>
            </div>

            <div className="feature med">
              <div className="f-num">06</div>
              <div className="f-title">{t('f6.t')}</div>
              <div className="f-desc">{t('f6.d')}</div>
            </div>

            <div className="feature small">
              <div className="f-num">07</div>
              <div className="f-title">{t('f7.t')}</div>
              <div className="f-desc">{t('f7.d')}</div>
            </div>

            <div className="feature small">
              <div className="f-num">08</div>
              <div className="f-title">{t('f8.t')}</div>
              <div className="f-desc">{t('f8.d')}</div>
            </div>

            <div className="feature small">
              <div className="f-num">09</div>
              <div className="f-title">{t('f9.t')}</div>
              <div className="f-desc">{t('f9.d')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="block" id="how">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{t('how.eyebrow')}</span>
            <h2
              className="display"
              dangerouslySetInnerHTML={{ __html: t('how.h2') }}
            />
            <p className="sub">{t('how.sub')}</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="n">1</div>
              <h3>{t('s1.t')}</h3>
              <p>{t('s1.d')}</p>
              <div className="code">
                <span className="ok">✓</span> Jira Cloud · <span className="ok">✓</span> Azure
                DevOps · <span className="ok">✓</span> GitHub
              </div>
            </div>

            <div className="step">
              <div className="n">2</div>
              <h3>{t('s2.t')}</h3>
              <p>{t('s2.d')}</p>
              <div className="code">
                3 projects → <span className="kw">sync</span> → ready
              </div>
            </div>

            <div className="step">
              <div className="n">3</div>
              <h3>{t('s3.t')}</h3>
              <p>{t('s3.d')}</p>
              <div className="code">
                last sync: <span className="ok">2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE APP */}
      <section className="block" id="mobile">
        <div className="wrap">
          <div className="mobile-grid">
            <div className="mobile-copy">
              <span className="eyebrow">{t('mob.eyebrow')}</span>
              <h2
                className="display"
                style={{ marginTop: '18px' }}
                dangerouslySetInnerHTML={{ __html: t('mob.h2') }}
              />
              <p className="mobile-sub">{t('mob.sub')}</p>
              <ul className="mobile-bullets">
                <li>
                  <span className="mb-dot"></span>
                  <span dangerouslySetInnerHTML={{ __html: t('mob.b1') }} />
                </li>
                <li>
                  <span className="mb-dot"></span>
                  <span dangerouslySetInnerHTML={{ __html: t('mob.b2') }} />
                </li>
                <li>
                  <span className="mb-dot"></span>
                  <span dangerouslySetInnerHTML={{ __html: t('mob.b3') }} />
                </li>
              </ul>
              <div className="store-badges">
                <a href="#" className="store-badge" aria-label="Download on the App Store">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M17.05 12.54c-.03-2.97 2.43-4.4 2.54-4.47-1.39-2.03-3.55-2.31-4.32-2.34-1.83-.19-3.59 1.08-4.53 1.08-.95 0-2.39-1.06-3.94-1.03-2.02.03-3.9 1.18-4.95 2.99-2.14 3.7-.55 9.15 1.52 12.14 1.02 1.46 2.22 3.1 3.8 3.04 1.53-.06 2.11-.98 3.96-.98 1.84 0 2.37.98 3.99.95 1.65-.03 2.69-1.49 3.68-2.95 1.17-1.69 1.65-3.33 1.67-3.41-.04-.02-3.2-1.23-3.42-4.89v-.13zM14.11 4.1c.83-1 1.39-2.4 1.23-3.79-1.2.05-2.65.8-3.51 1.8-.77.89-1.44 2.3-1.26 3.66 1.34.1 2.71-.68 3.54-1.67z" />
                  </svg>
                  <span>
                    <small>{t('mob.dlt')}</small>App Store
                  </span>
                </a>
                <a href="#" className="store-badge" aria-label="Get it on Google Play">
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.6 2.3z" fill="currentColor" opacity=".75" />
                    <path d="M16 15.3l-3-3v-.2l3-3 .1.1 3.6 2.1c1 .6 1 1.5 0 2.1l-3.7 2z" fill="currentColor" opacity=".9" />
                    <path d="M16.1 15.2l-3.1-3.1L3.6 21.7c.4.4 1 .4 1.7.1l10.8-6.6" fill="currentColor" opacity=".6" />
                    <path d="M16.1 9L5.3 2.4c-.7-.4-1.3-.3-1.7.1l9.4 9.4 3.1-2.9z" fill="currentColor" />
                  </svg>
                  <span>
                    <small>{t('mob.gon')}</small>Google Play
                  </span>
                </a>
              </div>
              <div className="mobile-meta">
                <span>{t('mob.meta1')}</span>
                <span className="sep">·</span>
                <span>{t('mob.meta2')}</span>
              </div>
            </div>

            <div className="phones">
              {/* Phone A - Portfolio */}
              <div className="phone phone-a" aria-hidden="true">
                <div className="phone-frame">
                  <div className="phone-notch"></div>
                  <div className="phone-screen">
                    <div className="ph-status">
                      <span>9:41</span>
                      <span className="ph-icons">
                        <svg viewBox="0 0 18 12" width="18" height="12">
                          <rect x="0" y="4" width="3" height="8" rx="1" fill="currentColor" />
                          <rect x="4" y="2" width="3" height="10" rx="1" fill="currentColor" />
                          <rect x="8" y="0" width="3" height="12" rx="1" fill="currentColor" />
                          <rect x="13" y="3" width="4" height="7" rx="1" fill="currentColor" opacity=".4" />
                        </svg>
                        <svg viewBox="0 0 20 12" width="20" height="12">
                          <rect x="0" y="1" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
                          <rect x="2" y="3" width="10" height="6" rx="1" fill="currentColor" />
                          <rect x="17" y="4" width="2" height="4" rx="1" fill="currentColor" />
                        </svg>
                      </span>
                    </div>
                    <div className="ph-topbar">
                      <div>
                        <div className="ph-t-hi">{t('ph.hi')}</div>
                        <div className="ph-t-sub">{t('ph.sub')}</div>
                      </div>
                      <div className="ph-avatar">PS</div>
                    </div>
                    <div className="ph-section">
                      <div className="ph-sec-title">{t('ph.portfolio')}</div>
                      <div className="ph-health-ring">
                        <svg viewBox="0 0 120 120" width="120" height="120">
                          <circle cx="60" cy="60" r="48" fill="none" stroke="var(--cream-3)" strokeWidth="10" />
                          <circle cx="60" cy="60" r="48" fill="none" stroke="oklch(0.58 0.12 145)" strokeWidth="10" strokeDasharray="180 301" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 60 60)" />
                          <circle cx="60" cy="60" r="48" fill="none" stroke="oklch(0.72 0.15 75)" strokeWidth="10" strokeDasharray="60 301" strokeDashoffset="-180" strokeLinecap="round" transform="rotate(-90 60 60)" />
                          <circle cx="60" cy="60" r="48" fill="none" stroke="oklch(0.58 0.18 25)" strokeWidth="10" strokeDasharray="28 301" strokeDashoffset="-240" strokeLinecap="round" transform="rotate(-90 60 60)" />
                        </svg>
                        <div className="ph-ring-center">
                          <div className="ph-ring-num">4</div>
                          <div className="ph-ring-lbl">{t('ph.onTrack')}</div>
                        </div>
                      </div>
                      <div className="ph-legend">
                        <span>
                          <i style={{ background: 'oklch(0.58 0.12 145)' }}></i>4 <small>{t('ph.ok')}</small>
                        </span>
                        <span>
                          <i style={{ background: 'oklch(0.72 0.15 75)' }}></i>1 <small>{t('ph.risk')}</small>
                        </span>
                        <span>
                          <i style={{ background: 'oklch(0.58 0.18 25)' }}></i>1 <small>{t('ph.late')}</small>
                        </span>
                      </div>
                    </div>
                    <div className="ph-section">
                      <div className="ph-sec-title">{t('ph.projects')}</div>
                      <div className="ph-plist">
                        <div className="ph-pitem ok">
                          <div>
                            <div className="ph-pn">Acme · Checkout v2</div>
                            <div className="ph-pm">Sprint 14 · 8d left</div>
                          </div>
                          <div className="ph-pdot">{t('ph.pct1')}</div>
                        </div>
                        <div className="ph-pitem ok">
                          <div>
                            <div className="ph-pn">Vinho Verde · CMS</div>
                            <div className="ph-pm">Sprint 7 · 3d left</div>
                          </div>
                          <div className="ph-pdot">{t('ph.pct2')}</div>
                        </div>
                        <div className="ph-pitem risk">
                          <div>
                            <div className="ph-pn">Odra · Mobile app</div>
                            <div className="ph-pm">Sprint 22 · stale PRs</div>
                          </div>
                          <div className="ph-pdot">{t('ph.pct3')}</div>
                        </div>
                      </div>
                    </div>
                    <div className="ph-tabbar">
                      <span className="active">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M3 12l9-8 9 8M5 10v10h14V10" />
                        </svg>
                      </span>
                      <span>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="4" y="4" width="16" height="16" rx="2" />
                          <path d="M4 10h16M10 4v16" />
                        </svg>
                      </span>
                      <span>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
                          <path d="M10 20a2 2 0 004 0" />
                        </svg>
                      </span>
                      <span>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 21a8 8 0 0116 0" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone B - Sprint Detail */}
              <div className="phone phone-b" aria-hidden="true">
                <div className="phone-frame">
                  <div className="phone-notch"></div>
                  <div className="phone-screen">
                    <div className="ph-status">
                      <span>9:41</span>
                      <span className="ph-icons">
                        <svg viewBox="0 0 18 12" width="18" height="12">
                          <rect x="0" y="4" width="3" height="8" rx="1" fill="currentColor" />
                          <rect x="4" y="2" width="3" height="10" rx="1" fill="currentColor" />
                          <rect x="8" y="0" width="3" height="12" rx="1" fill="currentColor" />
                          <rect x="13" y="3" width="4" height="7" rx="1" fill="currentColor" opacity=".4" />
                        </svg>
                        <svg viewBox="0 0 20 12" width="20" height="12">
                          <rect x="0" y="1" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
                          <rect x="2" y="3" width="10" height="6" rx="1" fill="currentColor" />
                          <rect x="17" y="4" width="2" height="4" rx="1" fill="currentColor" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '18px', color: 'var(--accent-deep)', cursor: 'pointer' }}>‹</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>Acme · Checkout v2</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--ink-3)', marginTop: '2px' }}>Sprint 14 · 8 days remaining</div>
                      </div>
                    </div>
                    <div style={{ padding: '8px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '400', color: 'var(--accent-deep)' }}>92<small style={{ fontSize: '12px', color: 'var(--ink-3)' }}>%</small></div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>{t('ph.delivery')}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '400' }}>2.1<small style={{ fontSize: '12px', color: 'var(--ink-3)' }}>d</small></div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>{t('ph.cycle')}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '400' }}>14</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>{t('ph.prs')}</div>
                      </div>
                    </div>
                    <div style={{ padding: '6px 14px 10px' }}>
                      <div className="ph-sec-title">{t('ph.burndown')}</div>
                      <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: '10px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('ph.ahead')}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 7px', borderRadius: '999px', background: 'color-mix(in oklab, var(--good) 15%, transparent)', color: 'var(--good)' }}>{t('ph.ontrack')}</div>
                        </div>
                        <svg viewBox="0 0 200 60" style={{ width: '100%', height: '60px' }}>
                          <line x1="0" y1="10" x2="200" y2="50" stroke="var(--ink-3)" strokeDasharray="2 3" strokeOpacity="0.3" />
                          <path d="M 0 10 L 40 18 L 80 24 L 120 32 L 160 38 L 200 42" fill="none" stroke="var(--accent-deep)" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="120" cy="32" r="3" fill="var(--accent)" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ padding: '6px 14px 10px' }}>
                      <div className="ph-sec-title">{t('ph.recent')}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--good)' }}></span>
                          PR #204 merged · 2h ago
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }}></span>
                          6 cards moved to Done
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone C - Alerts */}
              <div className="phone phone-c" aria-hidden="true">
                <div className="phone-frame">
                  <div className="phone-notch"></div>
                  <div className="phone-screen">
                    <div className="ph-status">
                      <span>9:41</span>
                      <span className="ph-icons">
                        <svg viewBox="0 0 18 12" width="18" height="12">
                          <rect x="0" y="4" width="3" height="8" rx="1" fill="currentColor" />
                          <rect x="4" y="2" width="3" height="10" rx="1" fill="currentColor" />
                          <rect x="8" y="0" width="3" height="12" rx="1" fill="currentColor" />
                          <rect x="13" y="3" width="4" height="7" rx="1" fill="currentColor" opacity=".4" />
                        </svg>
                        <svg viewBox="0 0 20 12" width="20" height="12">
                          <rect x="0" y="1" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
                          <rect x="2" y="3" width="10" height="6" rx="1" fill="currentColor" />
                          <rect x="17" y="4" width="2" height="4" rx="1" fill="currentColor" />
                        </svg>
                      </span>
                    </div>
                    <div style={{ padding: '16px 16px 12px' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '400', letterSpacing: '-0.02em' }}>{t('ph.alerts')}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{t('ph.today')}</div>
                    </div>
                    <div style={{ padding: '0 14px 10px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '5px 10px', borderRadius: '999px', background: 'var(--cream-2)', color: 'var(--ink-2)', border: '1px solid var(--rule)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block' }}>{t('ph.filter')}</div>
                    </div>
                    <div style={{ padding: '6px 14px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderLeft: '3px solid oklch(0.58 0.18 25)', borderRadius: '8px', padding: '8px 10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--ink)' }}>PR stale 72h</div>
                        <div style={{ fontSize: '9px', color: 'var(--ink-3)', marginTop: '2px' }}>feat(reports): quarterly PDF</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--ink-3)', marginTop: '3px' }}>Acme · #PRJ-172 · 76h</div>
                      </div>
                      <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderLeft: '3px solid oklch(0.72 0.15 75)', borderRadius: '8px', padding: '8px 10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--ink)' }}>Sprint at risk</div>
                        <div style={{ fontSize: '9px', color: 'var(--ink-3)', marginTop: '2px' }}>Odra · Mobile app</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--ink-3)', marginTop: '3px' }}>64% complete · 4d left</div>
                      </div>
                      <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderLeft: '3px solid var(--accent)', borderRadius: '8px', padding: '8px 10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--ink)' }}>Done without code</div>
                        <div style={{ fontSize: '9px', color: 'var(--ink-3)', marginTop: '2px' }}>Update footer links</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--ink-3)', marginTop: '3px' }}>Vinho Verde · #VV-89</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="block" id="pricing">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{t('pr.eyebrow')}</span>
            <h2
              className="display"
              dangerouslySetInnerHTML={{ __html: t('pr.h2') }}
            />
            <p className="sub">{t('pr.sub')}</p>
          </div>

          <div className="plans">
            <div className="plan">
              <h3>{t('pr.p1n')}</h3>
              <div className="plan-price">
                R$99<small>/ mês</small>
              </div>
              <div className="plan-desc">{t('pr.p1d')}</div>
              <ul className="plan-feats">
                <li>{t('pr.p1f1')}</li>
                <li>{t('pr.p1f2')}</li>
                <li>{t('pr.p1f3')}</li>
                <li>{t('pr.p1f4')}</li>
                <li>{t('pr.p1f5')}</li>
                <li>{t('pr.p1f6')}</li>
              </ul>
              <Link href="/register" className="btn outline">
                {t('pr.cta')}
              </Link>
            </div>

            <div className="plan featured">
              <div className="tag">{t('pr.tag')}</div>
              <h3>{t('pr.p2n')}</h3>
              <div className="plan-price">
                R$249<small>/ mês</small>
              </div>
              <div className="plan-desc">{t('pr.p2d')}</div>
              <ul className="plan-feats">
                <li>{t('pr.p2f1')}</li>
                <li>{t('pr.p2f2')}</li>
                <li>{t('pr.p2f3')}</li>
                <li>{t('pr.p2f4')}</li>
                <li>{t('pr.p2f5')}</li>
                <li>{t('pr.p2f6')}</li>
              </ul>
              <Link href="/register" className="btn primary">
                {t('pr.cta')}
              </Link>
            </div>

            <div className="plan">
              <h3>{t('pr.p3n')}</h3>
              <div className="plan-price">
                R$499<small>/ mês</small>
              </div>
              <div className="plan-desc">{t('pr.p3d')}</div>
              <ul className="plan-feats">
                <li>{t('pr.p3f1')}</li>
                <li>{t('pr.p3f2')}</li>
                <li>{t('pr.p3f3')}</li>
                <li>{t('pr.p3f4')}</li>
                <li>{t('pr.p3f5')}</li>
                <li>{t('pr.p3f6')}</li>
              </ul>
              <Link href="/register" className="btn outline">
                {t('pr.cta')}
              </Link>
            </div>
          </div>

          <div className="billing-note">
            {t('pr.note1')} <strong>20%</strong> {t('pr.note2')}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="block">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{t('t.eyebrow')}</span>
            <h2
              className="display"
              dangerouslySetInnerHTML={{ __html: t('t.h2') }}
            />
          </div>

          <div className="quotes">
            <div className="quote">
              <div className="mark">"</div>
              <p>{t('q1.p')}</p>
              <div className="who">
                <div className="av">CT</div>
                <div className="meta">
                  <div className="nm">Carlos Teixeira</div>
                  <div className="rl">{t('q1.r')}</div>
                </div>
              </div>
            </div>

            <div className="quote">
              <div className="mark">"</div>
              <p>{t('q2.p')}</p>
              <div className="who">
                <div className="av">MR</div>
                <div className="meta">
                  <div className="nm">Marina Ribeiro</div>
                  <div className="rl">{t('q2.r')}</div>
                </div>
              </div>
            </div>

            <div className="quote">
              <div className="mark">"</div>
              <p>{t('q3.p')}</p>
              <div className="who">
                <div className="av">LN</div>
                <div className="meta">
                  <div className="nm">Lucas Neves</div>
                  <div className="rl">{t('q3.r')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="block" id="faq">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{t('faq.eyebrow')}</span>
            <h2
              className="display"
              dangerouslySetInnerHTML={{ __html: t('faq.h2') }}
            />
          </div>

          <div className="faq">
            <details>
              <summary>{t('faq.q1')}</summary>
              <p>{t('faq.a1')}</p>
            </details>

            <details>
              <summary>{t('faq.q2')}</summary>
              <p>{t('faq.a2')}</p>
            </details>

            <details>
              <summary>{t('faq.q3')}</summary>
              <p>{t('faq.a3')}</p>
            </details>

            <details>
              <summary>{t('faq.q4')}</summary>
              <p>{t('faq.a4')}</p>
            </details>

            <details>
              <summary>{t('faq.q5')}</summary>
              <p>{t('faq.a5')}</p>
            </details>

            <details>
              <summary>{t('faq.q6')}</summary>
              <p>{t('faq.a6')}</p>
            </details>

            <details>
              <summary>{t('faq.q7')}</summary>
              <p>{t('faq.a7')}</p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="block">
        <div className="wrap">
          <div className="final">
            <h2 dangerouslySetInnerHTML={{ __html: t('cta.h2') }} />
            <p className="sub">{t('cta.sub')}</p>
            <div className="cta-row">
              <Link href="/register" className="btn primary">
                {t('cta.b1')} <span className="arr">→</span>
              </Link>
              <a href="mailto:contato@spravio.io" className="btn outline">
                {t('cta.b2')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site">
        <div className="wrap">
          <div className="grid">
            <div className="col brand">
              <Link href="/" className="logo">
                <span className="logo-mark"></span>
                <span className="logo-word">Spravio</span>
              </Link>
              <p>{t('foot.tag')}</p>
            </div>

            <div className="col">
              <h4>{t('foot.prod')}</h4>
              <a href="#features">{t('nav.features')}</a>
              <a href="#pricing">{t('nav.pricing')}</a>
              <a href="#how">{t('nav.how')}</a>
              <a href="#faq">{t('nav.faq')}</a>
            </div>

            <div className="col">
              <h4>{t('foot.co')}</h4>
              <a href="/about">{t('foot.about')}</a>
              <a href="/blog">{t('foot.blog')}</a>
              <a href="/contact">{t('foot.contact')}</a>
              <a href="/careers">{t('foot.careers')}</a>
            </div>

            <div className="col">
              <h4>{t('foot.leg')}</h4>
              <a href="/privacy">{t('foot.priv')}</a>
              <a href="/terms">{t('foot.terms')}</a>
              <a href="/security">{t('foot.sec')}</a>
              <a href="/status">{t('foot.status')}</a>
            </div>
          </div>

          <div className="bottom">
            <div>© 2026 Spravio. Todos os direitos reservados.</div>
            <div>{t('foot.loc')}</div>
          </div>
        </div>
      </footer>
    </>
  )
}
