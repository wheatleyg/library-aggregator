<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  category: '',
  message: ''
})

const categories = [
  'Book recommendation',
  'Report a missing book',
  'General question',
  'Technical issue',
  'Other'
]

const submitted = ref(false)
const focused = ref('')

function submit() {
  submitted.value = true
}
</script>

<template>
  <div class="contact-root">
    <!-- Decorative background pattern -->
    <div class="bg-pattern" aria-hidden="true">
      <div class="grid-lines" />
      <div class="orb orb-1" />
      <div class="orb orb-2" />
    </div>

    <!-- Header -->
    <header class="header-band">
      <div class="inner">
        <div class="header-eyebrow">
          <span class="eyebrow-dot" />
          Franklin Central Library
        </div>
        <h1 class="header-title">Get in Touch</h1>
        <p class="header-sub">
          Questions, suggestions, or something missing from the catalog?<br>
          We're here to help — reach out or stop by.
        </p>
      </div>
    </header>

    <!-- Main grid -->
    <main class="main-grid inner">

      <!-- ── Contact form ── -->
      <section class="form-card">
        <Transition name="fade-slide" mode="out-in">

          <!-- Form state -->
          <div v-if="!submitted" key="form">
            <h2 class="section-label">Send a message</h2>

            <form class="field-stack" @submit.prevent="submit">

              <div class="field-row">
                <!-- Name -->
                <div class="field-group" :class="{ active: focused === 'name' }">
                  <label class="field-label">Your name</label>
                  <UInput
                    v-model="form.name"
                    placeholder="First Last"
                    required
                    size="lg"
                    @focus="focused = 'name'"
                    @blur="focused = ''"
                  />
                </div>

                <!-- Email -->
                <div class="field-group" :class="{ active: focused === 'email' }">
                  <label class="field-label">Student email</label>
                  <UInput
                    v-model="form.email"
                    type="email"
                    placeholder="you@fcs.k12.in.us"
                    required
                    size="lg"
                    @focus="focused = 'email'"
                    @blur="focused = ''"
                  />
                </div>
              </div>

              <!-- Category -->
              <div class="field-group" :class="{ active: focused === 'category' }">
                <label class="field-label">Category</label>
                <USelect
                  v-model="form.category"
                  :items="categories"
                  placeholder="What's this about?"
                  size="lg"
                  @focus="focused = 'category'"
                  @blur="focused = ''"
                />
              </div>

              <!-- Message -->
              <div class="field-group" :class="{ active: focused === 'message' }">
                <label class="field-label">Message</label>
                <UTextarea
                  v-model="form.message"
                  placeholder="Tell us what's on your mind…"
                  :rows="6"
                  required
                  size="lg"
                  @focus="focused = 'message'"
                  @blur="focused = ''"
                />
              </div>

              <div class="submit-row">
                <UButton
                  type="submit"
                  label="Send message"
                  trailing-icon="i-lucide-send"
                  size="lg"
                  class="submit-btn"
                />
                <span class="submit-hint">We reply within one school day.</span>
              </div>
            </form>
          </div>

          <!-- Success state -->
          <div v-else key="success" class="success-state">
            <div class="success-icon-wrap">
              <div class="success-ring" />
              <UIcon name="i-lucide-check" class="success-icon" />
            </div>
            <h2 class="success-title">Message sent!</h2>
            <p class="success-body">
              Thanks for reaching out. We'll get back to you within one school day.
            </p>
            <UButton
              variant="outline"
              label="Send another message"
              icon="i-lucide-arrow-left"
              @click="submitted = false; Object.assign(form, { name: '', email: '', category: '', message: '' })"
            />
          </div>

        </Transition>
      </section>

      <!-- ── Sidebar ── -->
      <aside class="sidebar">

        <!-- Info card -->
        <div class="info-card">
          <h3 class="info-title">Find us</h3>
          <ul class="info-list">
            <li class="info-item">
              <span class="info-icon-wrap">
                <UIcon name="i-lucide-map-pin" class="info-icon" />
              </span>
              <div>
                <p class="info-item-label">Franklin Central High School</p>
                <p class="info-item-sub">6215 E. Southeastern Ave<br>Indianapolis, IN 46203</p>
              </div>
            </li>
            <li class="info-item">
              <span class="info-icon-wrap">
                <UIcon name="i-lucide-mail" class="info-icon" />
              </span>
              <div>
                <p class="info-item-label">Email</p>
                <a href="mailto:library@fcs.k12.in.us" class="info-link">
                  library@fcs.k12.in.us
                </a>
              </div>
            </li>
            <li class="info-item">
              <span class="info-icon-wrap">
                <UIcon name="i-lucide-clock" class="info-icon" />
              </span>
              <div>
                <p class="info-item-label">Hours</p>
                <p class="info-item-sub">Mon – Fri &nbsp;·&nbsp; 7:30 AM – 4:00 PM</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- CTA card -->
        <div class="cta-card">
          <div class="cta-icon-wrap">
            <UIcon name="i-lucide-book-open" class="cta-icon" />
          </div>
          <h3 class="cta-title">Can't find a book?</h3>
          <p class="cta-body">
            Browse the catalog or let us know — we'll do our best to track it down.
          </p>
          <UButton
            to="/catalog"
            variant="outline"
            label="Search the catalog"
            icon="i-lucide-search"
            size="sm"
            block
            class="cta-btn"
          />
        </div>

      </aside>
    </main>
  </div>
</template>

<style scoped>
/* ── Tokens ── */
.contact-root {
  --accent: var(--color-primary-500, #3b82f6);
  --accent-soft: color-mix(in srgb, var(--accent) 10%, transparent);
  --radius-card: 1.25rem;
  --shadow-card: 0 1px 3px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.06);
  --font-display: 'Georgia', 'Times New Roman', serif;

  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── Decorative background ── */
.bg-pattern {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--color-gray-200, #e5e7eb) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-gray-200, #e5e7eb) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.35;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 30%, transparent 100%);
}

.dark .grid-lines {
  background-image:
    linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
  opacity: 1;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: .18;
}

.orb-1 {
  width: 520px; height: 520px;
  top: -160px; right: -80px;
  background: var(--accent);
}

.orb-2 {
  width: 340px; height: 340px;
  bottom: 10%; left: -60px;
  background: color-mix(in srgb, var(--accent) 60%, #10b981);
}

/* ── Layout helpers ── */
.inner {
  position: relative;
  z-index: 1;
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2.5rem);
}

/* ── Header ── */
.header-band {
  padding-block: 4rem 3rem;
  position: relative;
  z-index: 1;
}

.header-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
}

.eyebrow-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .5; transform: scale(1.4); }
}

.header-title {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -.02em;
  color: var(--color-gray-900, #111827);
  margin-bottom: .875rem;
}

.dark .header-title { color: var(--color-gray-50, #f9fafb); }

.header-sub {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-gray-500, #6b7280);
  max-width: 42ch;
}

/* ── Main grid ── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding-bottom: 5rem;
}

@media (min-width: 1024px) {
  .main-grid { grid-template-columns: 1fr 320px; gap: 2.5rem; }
}

/* ── Form card ── */
.form-card {
  background: var(--color-white, #fff);
  border: 1px solid var(--color-gray-200, #e5e7eb);
  border-radius: var(--radius-card);
  padding: clamp(1.5rem, 4vw, 2.5rem);
  box-shadow: var(--shadow-card);
}

.dark .form-card {
  background: var(--color-gray-900, #111827);
  border-color: var(--color-gray-800, #1f2937);
}

.section-label {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800, #1f2937);
  margin-bottom: 1.75rem;
  padding-bottom: .875rem;
  border-bottom: 1px solid var(--color-gray-100, #f3f4f6);
}

.dark .section-label {
  color: var(--color-gray-100, #f3f4f6);
  border-color: var(--color-gray-800, #1f2937);
}

/* Fields */
.field-stack { display: flex; flex-direction: column; gap: 1.25rem; }

.field-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 640px) { .field-row { grid-template-columns: 1fr 1fr; } }

.field-group {
  display: flex;
  flex-direction: column;
  gap: .375rem;
  transition: transform .15s ease;
}
.field-group.active { transform: translateY(-1px); }

.field-label {
  font-size: .8125rem;
  font-weight: 600;
  letter-spacing: .02em;
  color: var(--color-gray-600, #4b5563);
}
.dark .field-label { color: var(--color-gray-400, #9ca3af); }

/* Submit row */
.submit-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: .5rem;
  flex-wrap: wrap;
}

.submit-hint {
  font-size: .8125rem;
  color: var(--color-gray-400, #9ca3af);
}

.submit-btn {
  transition: transform .15s ease, box-shadow .15s ease;
}
.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent);
}

/* ── Success state ── */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-block: 3rem;
  gap: 1rem;
}

.success-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem; height: 4.5rem;
  margin-bottom: .5rem;
}

.success-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--accent);
  opacity: .25;
  animation: ring-expand .6s ease-out forwards;
}

@keyframes ring-expand {
  from { transform: scale(.6); opacity: .6; }
  to   { transform: scale(1.15); opacity: 0; }
}

.success-icon {
  font-size: 2rem;
  color: var(--accent);
  position: relative;
  z-index: 1;
}

.success-title {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--color-gray-900, #111827);
}
.dark .success-title { color: var(--color-gray-50, #f9fafb); }

.success-body {
  font-size: .9375rem;
  color: var(--color-gray-500, #6b7280);
  max-width: 36ch;
  line-height: 1.6;
}

/* ── Sidebar ── */
.sidebar { display: flex; flex-direction: column; gap: 1.25rem; }

/* Shared card base */
.info-card,
.cta-card {
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200, #e5e7eb);
  background: var(--color-white, #fff);
  box-shadow: var(--shadow-card);
  padding: 1.5rem;
}

.dark .info-card,
.dark .cta-card {
  background: var(--color-gray-900, #111827);
  border-color: var(--color-gray-800, #1f2937);
}

/* Info card */
.info-title,
.cta-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-800, #1f2937);
  margin-bottom: 1.125rem;
}
.dark .info-title,
.dark .cta-title { color: var(--color-gray-100, #f3f4f6); }

.info-list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  gap: .875rem;
  align-items: flex-start;
}

.info-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem; height: 2.125rem;
  border-radius: .5rem;
  background: var(--accent-soft);
  flex-shrink: 0;
  margin-top: .125rem;
}

.info-icon {
  font-size: 1rem;
  color: var(--accent);
}

.info-item-label {
  font-size: .875rem;
  font-weight: 600;
  color: var(--color-gray-700, #374151);
  margin-bottom: .125rem;
}
.dark .info-item-label { color: var(--color-gray-200, #e5e7eb); }

.info-item-sub {
  font-size: .8125rem;
  line-height: 1.5;
  color: var(--color-gray-500, #6b7280);
}

.info-link {
  font-size: .8125rem;
  color: var(--color-gray-500, #6b7280);
  transition: color .15s ease;
}
.info-link:hover { color: var(--accent); }

/* CTA card */
.cta-card { position: relative; overflow: hidden; }
.cta-card::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 140px; height: 140px;
  background: var(--accent-soft);
  border-radius: 50%;
}

.cta-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem; height: 2.5rem;
  border-radius: .625rem;
  background: var(--accent-soft);
  margin-bottom: .875rem;
  position: relative;
}

.cta-icon {
  font-size: 1.25rem;
  color: var(--accent);
}

.cta-body {
  font-size: .8125rem;
  color: var(--color-gray-500, #6b7280);
  line-height: 1.6;
  margin-bottom: 1rem;
  position: relative;
}

.cta-btn { position: relative; }

/* ── Transitions ── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to  { opacity: 0; transform: translateY(-8px); }
</style>
