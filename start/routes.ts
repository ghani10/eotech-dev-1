/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import EventsController from '#controllers/events_controller'

router.on('/').renderInertia('home', {}).as('home')

const api = 'api/v1'

// public API (bisa diakses tanpa autentikasi)
router.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// ─── Auth Routes (Guest only) ─────────────────────────────────────────────────
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    // Route Login (Halaman & Action)
    router.get('login', [controllers.Session, 'create']).as('login')
    
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())


// ─── Public Event API ─────────────────────────────────────────────────────────
router.get('/events', [EventsController, 'index']).as('public.events.index')
// routes.ts
// router.get('/events/:slug', [EventsController, 'showBySlugView']).as('public.events.show')
// router.get('/events/slug/:slug', async ({ inertia, params }) => {
//   return inertia.render('events/show', { slug: params.slug })
// }).as('public.events.show')

// Uncomment and fix this line
router.get('/events/:slug', [EventsController, 'showBySlugView']).as('public.events.show')



// ─── Event API ────────────────────────────────────────────────────────────────
router.group(() => {
  router.get(`${api}/events`, [EventsController, 'index']).as('api.events.index')
  router.get(`${api}/events/stats`, [EventsController, 'getStats']).as('api.events.stats')
  
}).prefix('')

router
  .group(() => {
    router.post(`${api}/events`, [EventsController, 'store'])
    router.get(`${api}/events/:id`, [EventsController, 'show'])
    router.put(`${api}/events/:id`, [EventsController, 'update'])
    // router.patch(`${api}/events/:id/status`, [EventsController, 'updateStatus'])
    router.delete(`${api}/events/:id`, [EventsController, 'destroy'])
  })
  .use(middleware.auth())
  .use(middleware.role(['event_organizer_admin', 'super_admin']))


// // ─── Event Member / Partner API ───────────────────────────────────────────────
// router
//   .group(() => {
//     router.post(`${api}/events/:eventId/members/invite`, [EventMembersController, 'invite'])
//     router.delete(`${api}/events/:eventId/members/:memberId`, [EventMembersController, 'revoke'])
//     router.get(`${api}/events/:eventId/members`, [EventMembersController, 'index'])
//   })
//   .use(middleware.auth())
//   .use(middleware.role(['event_organizer_admin', 'super_admin']))

// router.get(`${api}/invitations/:token`, [EventMembersController, 'acceptInvite'])


// // ─── Ticket Type API ──────────────────────────────────────────────────────────
// router
//   .group(() => {
//     router.get(`${api}/events/:eventId/ticket-types`, [TicketTypesController, 'index'])
//     router.post(`${api}/events/:eventId/ticket-types`, [TicketTypesController, 'store'])
//     router.put(`${api}/events/:eventId/ticket-types/:id`, [TicketTypesController, 'update'])
//     router.delete(`${api}/events/:eventId/ticket-types/:id`, [TicketTypesController, 'destroy'])
//   })
//   .use(middleware.auth())
//   .use(middleware.role(['event_organizer_admin', 'super_admin']))


// // ─── Order & Payment API ──────────────────────────────────────────────────────
// router
//   .group(() => {
//     router.post(`${api}/orders`, [OrdersController, 'store'])
//     router.get(`${api}/orders/:id`, [OrdersController, 'show'])
//     router.get(`${api}/orders/:id/tickets`, [OrdersController, 'tickets'])
//   })
//   .use(middleware.auth())
//   .use(middleware.role(['participant', 'event_organizer_admin', 'super_admin']))

// router.get(`${api}/tickets/:ticketId/status`, [TicketsController, 'checkStatus'])


// // ─── Payment Webhook / Callback ───────────────────────────────────────────────
// router.post(`${api}/payments/webhook`, [PaymentsController, 'webhook'])


// // ─── Check-in API ─────────────────────────────────────────────────────────────
// router
//   .group(() => {
//     router.post(`${api}/checkin`, [TicketsController, 'checkin'])
//     router.get(`${api}/checkin/history`, [TicketsController, 'checkinHistory'])
//   })
//   .use(middleware.auth())
//   .use(middleware.role(['volunteer_organizer', 'event_organizer_admin', 'super_admin']))


// // ─── Dashboard & Reporting API ────────────────────────────────────────────────
// router
//   .group(() => {
//     router.get(`${api}/events/:eventId/dashboard`, [DashboardController, 'summary'])
//     router.get(`${api}/events/:eventId/reports/participants`, [DashboardController, 'exportParticipants'])
//     router.get(`${api}/events/:eventId/reports/transactions`, [DashboardController, 'exportTransactions'])
//     router.get(`${api}/events/:eventId/reports/checkins`, [DashboardController, 'exportCheckins'])
//   })
//   .use(middleware.auth())
//   .use(middleware.role(['event_organizer_admin', 'super_admin']))

// router
//   .group(() => {
//     router.get(`${api}/events/:eventId/dashboard/summary`, [DashboardController, 'partnerSummary'])
//   })
//   .use(middleware.auth())
//   .use(middleware.role(['volunteer_organizer', 'event_organizer_admin', 'super_admin']))



// ─── View Routes (Halaman Dashboard Admin) ───────────────────────────────────
router
  .group(() => {
    // Dashboard - accessible by all authenticated users
    router.get('/admin/dashboard', async ({ inertia }) => {
      return inertia.render('admin/dashboard', {})
    }).as('admin.dashboard')
  })
  .use(middleware.auth())

router
  .group(() => {
    // Kelola Event - requires event_organizer_admin or super_admin
    router.get('/admin/events', async ({ inertia }) => {
      return inertia.render('admin/events/index', {})
    }).as('admin.events')

    router.get('/admin/events/create', async ({ inertia }) => {
      return inertia.render('admin/events/create', {})
    }).as('admin.events.create')

    router.get('/admin/events/:id/edit', async ({ inertia, params }) => {
      return inertia.render('admin/events/edit', { eventId: params.id })
    }).as('admin.events.edit')

    // Laporan Penjualan - requires event_organizer_admin or super_admin
    router.get('/admin/reports', async ({ inertia }) => {
      return inertia.render('admin/reports/index', {})
    }).as('admin.reports')

    // Manajemen Kuota - requires event_organizer_admin or super_admin
    router.get('/admin/tickets/quota', async ({ inertia }) => {
      return inertia.render('admin/tickets/quota', {})
    }).as('admin.tickets.quota')

    router.get('/admin/tickets/quota/create', async ({ inertia }) => {
      return inertia.render('admin/tickets/create_quota', {})
    }).as('admin.tickets.quota.create')

    // Kolaborasi Partner - requires event_organizer_admin or super_admin
    router.get('/admin/partners', async ({ inertia }) => {
      return inertia.render('admin/partners/index', {})
    }).as('admin.partners')
  })
  .use(middleware.auth())
  .use(middleware.role(['event_organizer_admin', 'super_admin']))