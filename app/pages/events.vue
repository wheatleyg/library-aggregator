<script setup lang="ts">
// Placeholder events — replace with API data when available
const events = [
  {
    id: 1,
    title: 'Spring Book Fair',
    date: 'April 14–18, 2026',
    time: '7:30 AM – 3:30 PM',
    location: 'Library Commons',
    description: 'Browse and buy from hundreds of titles at our annual spring book fair. All purchases support the school library.',
    icon: 'i-lucide-book-open',
    badge: 'Upcoming'
  },
  {
    id: 2,
    title: 'Battle of the Books',
    date: 'April 25, 2026',
    time: '12:00 PM – 2:00 PM',
    location: 'Library Media Center',
    description: 'Teams compete to answer questions about this year\'s selected reading list. Sign up with your English teacher by April 18.',
    icon: 'i-lucide-trophy',
    badge: 'Upcoming'
  },
  {
    id: 3,
    title: 'Author Visit — TBA',
    date: 'May 7, 2026',
    time: '9:00 AM – 10:30 AM',
    location: 'Auditorium',
    description: 'A local author will visit Franklin Central to discuss their work and answer student questions. More details coming soon.',
    icon: 'i-lucide-mic',
    badge: 'Coming Soon'
  },
  {
    id: 4,
    title: 'Summer Reading Kickoff',
    date: 'May 23, 2026',
    time: '11:00 AM – 12:00 PM',
    location: 'Library Commons',
    description: 'Get your summer reading list, check out books, and learn about prizes for students who complete the summer reading challenge.',
    icon: 'i-lucide-sun',
    badge: 'Coming Soon'
  }
]

const hours = [
  { day: 'Monday – Friday', time: '7:30 AM – 4:00 PM' },
  { day: 'Saturday', time: 'Closed' },
  { day: 'Sunday', time: 'Closed' }
]
</script>

<template>
  <div>
    <!-- Header banner -->
    <div class="bg-elevated border-b border-default">
      <div class="mx-auto max-w-5xl px-4 py-10">
        <div class="flex items-center gap-3 mb-3">
          <UIcon
            name="i-lucide-calendar"
            class="text-primary text-2xl"
          />
          <h1 class="text-3xl font-bold">
            Events & Programs
          </h1>
        </div>
        <p class="text-muted max-w-xl">
          Stay in the loop on what's happening at the Franklin Central High School Library.
          From book fairs to author visits, there's always something going on.
        </p>
      </div>
    </div>

    <div class="mx-auto max-w-5xl px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Events list -->
      <div class="lg:col-span-2 flex flex-col gap-5">
        <h2 class="text-lg font-semibold">
          Upcoming Events
        </h2>

        <div
          v-for="event in events"
          :key="event.id"
          class="rounded-2xl border border-default bg-elevated p-5 flex gap-4 hover:shadow-md transition-shadow"
        >
          <div class="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UIcon
              :name="event.icon"
              class="text-primary text-lg"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <h3 class="font-semibold text-base">
                {{ event.title }}
              </h3>
              <UBadge
                :label="event.badge"
                variant="subtle"
                color="primary"
                size="sm"
              />
            </div>

            <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="text-xs" />
                {{ event.date }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-clock" class="text-xs" />
                {{ event.time }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="text-xs" />
                {{ event.location }}
              </span>
            </div>

            <p class="mt-2 text-sm text-muted leading-relaxed">
              {{ event.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col gap-5">
        <!-- Hours -->
        <div class="rounded-2xl border border-default bg-elevated p-5">
          <h2 class="font-semibold mb-4 flex items-center gap-2">
            <UIcon
              name="i-lucide-clock"
              class="text-primary"
            />
            Library Hours
          </h2>
          <ul class="flex flex-col gap-2">
            <li
              v-for="h in hours"
              :key="h.day"
              class="flex justify-between text-sm"
            >
              <span class="text-muted">{{ h.day }}</span>
              <span :class="h.time === 'Closed' ? 'text-red-500' : 'font-medium'">
                {{ h.time }}
              </span>
            </li>
          </ul>
          <p class="mt-3 text-xs text-muted">
            Hours may change on school holidays and exam days.
          </p>
        </div>

        <!-- CTA -->
        <div class="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <h2 class="font-semibold mb-1">
            Have an idea?
          </h2>
          <p class="text-sm text-muted mb-4">
            Want to suggest a program, club, or event? Let us know — we love hearing from students.
          </p>
          <UButton
            to="/contact"
            label="Get in touch"
            trailing-icon="i-lucide-arrow-right"
            size="sm"
            block
          />
        </div>
      </div>
    </div>
  </div>
</template>
