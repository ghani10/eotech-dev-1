import type { HttpContext } from '@adonisjs/core/http'
import { EventService, CreateEventData, UpdateEventData, PaginationParams } from '#services/event_service'
import { randomUUID } from 'node:crypto'

export default class EventsController {
  private eventService: EventService

  constructor() {
    this.eventService = new EventService()
  }

  /**
   * Generate a trace message ID for each request lifecycle
   */
  private generateMessageId(): string {
    return `EVT-${Date.now()}-${randomUUID().split('-')[0].toUpperCase()}`
  }

  /**
   * List all events with pagination, search, and caching
   * GET /api/v1/events
   * GET /events (public)
   */
  async index({ request, response, logger, auth }: HttpContext) {
    const messageId = this.generateMessageId()

    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 9)
      const status = request.input('status', 'publish') // default to publish for public safety
      const search = request.input('search', '')

      // Get user ID if authenticated (for filtering user's events)
      const user_id = auth.user?.user_id

      logger.info({ messageId, page, limit, status, search, user_id }, '[INDEX] Fetching event list')

      const params: PaginationParams = {
        page,
        limit,
        status: status as 'pending' | 'publish' | 'archived' | 'all',
        search: search || undefined,
        owner_id: user_id // Only show user's events if authenticated
      }

      const result = await this.eventService.getEventDataPublic(params)

      logger.info({ messageId, totalEvents: result.data.meta.total }, '[INDEX] Events fetched successfully')

      return response.ok(result)

    } catch (error: any) {
      logger.error({ messageId, error: error.message }, '[INDEX] Failed to fetch events')

      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to fetch events',
        error: error.message,
      })
    }
  }

  /**
   * Create a new event with file upload support
   * POST /api/v1/events
   */
  async store({ request, response, logger, auth }: HttpContext) {
    const messageId = this.generateMessageId()

    // Check authentication
    if (!auth.user) {
      return response.unauthorized({
        message_id: messageId,
        message: 'Authentication required'
      })
    }

    logger.info({ messageId, user_id: auth.user.user_id }, '[STORE] Creating new event')

    try {
      const {
        title,
        description,
        location,
        organizer_contact,
        registration_start_at,
        registration_end_at,
        banner,
        slug,
        status,
      } = request.only([
        'title',
        'description',
        'location',
        'organizer_contact',
        'registration_start_at',
        'registration_end_at',
        'banner',
        'slug',
        'status',
      ])

      // Prepare event data
      const eventData: CreateEventData = {
        title,
        description,
        location,
        organizer_contact,
        registration_start_at,
        registration_end_at,
        banner: request.file('banner') || undefined, // Handle file upload
        slug,
        status: status as 'pending' | 'publish' | 'archived',
        owner_id: auth.user.user_id
      }

      // Validate data
      const validation = this.eventService.validateEventData(eventData)
      if (!validation.valid) {
        logger.warn({ messageId, errors: validation.errors }, '[STORE] Validation failed')
        return response.unprocessableEntity({
          message_id: messageId,
          message: 'Validation failed',
          errors: validation.errors,
        })
      }

      // Create event
      const result = await this.eventService.createEvent(eventData)

      if (!result.success) {
        logger.error({ messageId, error: result.error }, '[STORE] Failed to create event')
        return response.badRequest({
          message_id: messageId,
          message: result.error,
        })
      }

      logger.info({ messageId, eventId: result.data?.event_id }, '[STORE] Event created successfully')

      return response.created({
        message_id: messageId,
        message: 'Event created successfully',
        data: result.data,
      })

    } catch (error: any) {
      logger.error({ messageId, error: error.message }, '[STORE] Failed to create event')

      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to create event',
        error: error.message,
      })
    }
  }

  /**
   * Show a single event by ID
   * GET /api/v1/events/:id
   */
  async show({ params, response, logger }: HttpContext) {
    const messageId = this.generateMessageId()
    const id = params.id

    logger.info({ messageId, eventId: id }, '[SHOW] Fetching event detail')

    if (!id) {
      logger.warn({ messageId }, '[SHOW] Missing event ID param')
      return response.badRequest({
        message_id: messageId,
        message: 'Event ID is required',
      })
    }

    try {
      const event = await this.eventService.getEventById(id)

      if (!event) {
        logger.warn({ messageId, eventId: id }, '[SHOW] Event not found')
        return response.notFound({
          message_id: messageId,
          message: `Event with ID ${id} not found`,
        })
      }

      logger.info({ messageId, eventId: id, status: event.status }, '[SHOW] Event found')

      return response.ok({
        message_id: messageId,
        message: 'success',
        data: event,
      })

    } catch (error: any) {
      logger.error({ messageId, eventId: id, error: error.message }, '[SHOW] Failed to fetch event')

      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to fetch event',
        error: error.message,
      })
    }
  }

  /**
   * Show a single event by slug (public shareable URL)
   * GET /events/slug/:slug
   */
  async showBySlug({ params, response, logger }: HttpContext) {
    const messageId = this.generateMessageId()
    const { slug } = params

    logger.info({ messageId, slug }, '[SHOW_SLUG] Fetching public event by slug')

    try {
      const event = await this.eventService.getEventBySlug(slug)

      if (!event) {
        logger.warn({ messageId, slug }, '[SHOW_SLUG] Publish event not found')
        return response.notFound({
          message_id: messageId,
          message: 'Event not found or not yet published',
        })
      }

      logger.info({ messageId, slug, eventId: event.event_id }, '[SHOW_SLUG] Public event returned')

      return response.ok({
        message_id: messageId,
        message: 'success',
        data: event,
      })

    } catch (error: any) {
      logger.error({ messageId, slug, error: error.message }, '[SHOW_SLUG] Error fetching event by slug')

      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to fetch event',
        error: error.message,
      })
    }
  }

  // EventsController
async showBySlugView({ params, inertia, response }: HttpContext) {
  const { slug } = params
  const event = await this.eventService.getEventBySlug(slug)

  if (!event) {
    return response.notFound({ message: 'Event not found' })
  }

  return inertia.render('events/show', { event })
}


  /**
   * Update event details or status
   * PUT /api/v1/events/:id
   */
  async update({ params, request, response, logger, auth }: HttpContext) {
    const messageId = this.generateMessageId()
    const id = params.id

    // Check authentication
    if (!auth.user) {
      return response.unauthorized({
        message_id: messageId,
        message: 'Authentication required'
      })
    }

    logger.info({ messageId, eventId: id, user_id: auth.user.user_id }, '[UPDATE] Updating event')

    if (!id) {
      return response.badRequest({
        message_id: messageId,
        message: 'Event ID is required',
      })
    }

    try {
      // Check if user owns the event (basic authorization)
      const existingEvent = await this.eventService.getEventById(id)
      if (!existingEvent) {
        return response.notFound({
          message_id: messageId,
          message: `Event with ID ${id} not found`,
        })
      }

      if (existingEvent.owner_id !== auth.user.user_id) {
        return response.forbidden({
          message_id: messageId,
          message: 'You do not have permission to update this event',
        })
      }

      const updateData: UpdateEventData = request.only([
        'title',
        'description',
        'location',
        'organizer_contact',
        'registration_start_at',
        'registration_end_at',
        'banner',
        'slug',
        'status',
      ])

      // Handle file upload
      const bannerFile = request.file('banner')
      if (bannerFile) {
        updateData.banner = bannerFile
      } else if (request.input('banner') === null) {
        // Explicitly set to null to remove banner
        updateData.banner = null
      }

      // Validate data
      const validation = this.eventService.validateEventData(updateData)
      if (!validation.valid) {
        logger.warn({ messageId, errors: validation.errors }, '[UPDATE] Validation failed')
        return response.unprocessableEntity({
          message_id: messageId,
          message: 'Validation failed',
          errors: validation.errors,
        })
      }

      // Update event
      const result = await this.eventService.updateEvent(id, updateData)

      if (!result.success) {
        logger.error({ messageId, error: result.error }, '[UPDATE] Failed to update event')
        return response.badRequest({
          message_id: messageId,
          message: result.error,
        })
      }

      logger.info({ messageId, eventId: id, updatedFields: Object.keys(updateData) }, '[UPDATE] Event updated')

      return response.ok({
        message_id: messageId,
        message: 'Event updated successfully',
        data: result.data,
      })

    } catch (error: any) {
      logger.error({ messageId, eventId: id, error: error.message }, '[UPDATE] Failed to update event')

      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to update event',
        error: error.message,
      })
    }
  }

  /**
   * Archive (soft delete) or hard delete an event
   * DELETE /api/v1/events/:id
   */
  async destroy({ params, request, response, logger, auth }: HttpContext) {
    const messageId = this.generateMessageId()
    const id = params.id
    const hardDelete = request.input('hard_delete', false)

    // Check authentication
    if (!auth.user) {
      return response.unauthorized({
        message_id: messageId,
        message: 'Authentication required'
      })
    }

    logger.info({ messageId, eventId: id, hardDelete, user_id: auth.user.user_id }, '[DESTROY] Deleting/archiving event')

    if (!id) {
      return response.badRequest({
        message_id: messageId,
        message: 'Event ID is required',
      })
    }

    try {
      // Check if user owns the event
      const existingEvent = await this.eventService.getEventById(id)
      if (!existingEvent) {
        return response.notFound({
          message_id: messageId,
          message: `Event with ID ${id} not found`,
        })
      }

      if (existingEvent.owner_id !== auth.user.user_id) {
        return response.forbidden({
          message_id: messageId,
          message: 'You do not have permission to delete this event',
        })
      }

      // Delete/archive event
      const result = await this.eventService.deleteEvent(id, hardDelete)

      if (!result.success) {
        logger.error({ messageId, error: result.error }, '[DESTROY] Failed to delete/archive event')
        return response.badRequest({
          message_id: messageId,
          message: result.error,
        })
      }

      const action = hardDelete ? 'permanently deleted' : 'archived'
      logger.info({ messageId, eventId: id }, `[DESTROY] Event ${action} successfully`)

      return response.ok({
        message_id: messageId,
        message: `Event ${action} successfully`,
        data: { event_id: id, action: hardDelete ? 'deleted' : 'archived' },
      })

    } catch (error: any) {
      logger.error({ messageId, eventId: id, error: error.message }, '[DESTROY] Failed to delete/archive event')

      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to process event deletion',
        error: error.message,
      })
    }
  }

  /**
   * Get event statistics for the authenticated user
   * GET /api/v1/events/stats
   */
  async getStats({ response, logger, auth }: HttpContext) {
    const messageId = this.generateMessageId()

    // Check authentication
    if (!auth.user) {
      return response.unauthorized({
        message_id: messageId,
        message: 'Authentication required'
      })
    }

    logger.info({ messageId, user_id: auth.user.user_id }, '[STATS] Fetching event statistics')

    try {
      const stats = await this.eventService.getEventStats(auth.user.user_id)

      logger.info({ messageId, stats }, '[STATS] Event statistics retrieved')

      return response.ok({
        message_id: messageId,
        message: 'success',
        data: stats,
      })

    } catch (error: any) {
      logger.error({ messageId, error: error.message }, '[STATS] Failed to fetch event statistics')

      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to fetch event statistics',
        error: error.message,
      })
    }
  }
}