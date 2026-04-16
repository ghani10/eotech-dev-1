import Event from "#models/event"
import db from '@adonisjs/lucid/services/db'
import { FileUploadService} from './file_upload_service.js'
import { CacheService } from './cache_service.js'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export interface EventData {
  event_id: string
  title: string
  description: string | null
  location: string
  organizer_contact: string
  registration_start_at: string
  registration_end_at: string
  banner: string | null
  status: 'pending' | 'publish' | 'archived'
  slug: string | null
  created_at: string
  updated_at: string
  owner_id: string
}

export interface CreateEventData {
  title: string
  description?: string
  location: string
  organizer_contact: string
  registration_start_at: string
  registration_end_at: string
  banner?: MultipartFile
  status?: 'pending' | 'publish' | 'archived'
  slug?: string
  owner_id: string
}

export interface UpdateEventData {
  title?: string
  description?: string
  location?: string
  organizer_contact?: string
  registration_start_at?: string
  registration_end_at?: string
  banner?: MultipartFile | null
  status?: 'pending' | 'publish' | 'archived'
  slug?: string
}

export interface PaginationParams {
  page: number
  limit: number
  status?: 'pending' | 'publish' | 'archived' | 'all'
  search?: string
  owner_id?: string
}

export interface PaginatedResponse<T> {
  message_id: string
  message: string
  data: {
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
      from: number
      to: number
    }
    data_events: T[]
  }
}

export class EventService {
  private eventModel: typeof Event

  constructor() {
    this.eventModel = Event
  }

  /**
   * Generate a trace message ID for each request lifecycle
   */
  private generateMessageId(): string {
    return `EVT-${Date.now()}-${randomUUID().split('-')[0].toUpperCase()}`
  }

  /**
   * Convert Event model to JSON
   */
// ✅ Perbaiki toJSON
  toJSON(event: Event): EventData {
    const toISO = (val: any) => {
      if (!val) return ''
      if (typeof val === 'string') return val
      if (val?.toISO) return val.toISO()!
      return new Date(val).toISOString()
    }

    return {
      event_id: event.event_id,
      title: event.title,
      description: event.description,
      location: event.location,
      organizer_contact: event.organizer_contact,
      registration_start_at: toISO(event.registrationStartAt),
      registration_end_at: toISO(event.registrationEndAt),
      banner: event.banner,
      status: event.status,
      slug: event.slug,
      created_at: toISO(event.createdAt) || new Date().toISOString(),
      updated_at: toISO(event.updatedAt) || new Date().toISOString(),
      owner_id: event.owner_id
    }
  }

  /**
   * Get paginated events with caching and search
   */
  async getEventDataPublic(params: PaginationParams): Promise<PaginatedResponse<EventData>> {
    const { page, limit, status, search, owner_id } = params

    // Validate parameters
    if (page < 1 || limit < 1 || (status && status !== 'all' && !['pending', 'publish', 'archived'].includes(status))) {
      throw new Error('Invalid request parameters')
    }

    const cacheKey = CacheService.getEventListCacheKey({ page, limit, status: status || 'all', search })
    const cacheTags = [...CacheService.CONFIGS.TAGS.EVENTS, ...CacheService.CONFIGS.TAGS.PUBLIC]

    return CacheService.remember(
      cacheKey,
      async () => {
        const messageId = this.generateMessageId()

        try {
          let query = this.eventModel.query()

          // Apply status filter
          if (status && status !== 'all') {
            query = query.where('status', status)
          }

          // Apply owner filter if provided
          if (owner_id) {
            query = query.where('owner_id', owner_id)
          }

          // Apply search filter
          if (search) {
            query = query.where((q) => {
              q.where('title', 'like', `%${search}%`)
                .orWhere('description', 'like', `%${search}%`)
                .orWhere('location', 'like', `%${search}%`)
            })
          }

          // Get paginated results
          const paginatedEvents = await query
            .orderBy('created_at', 'desc')
            .paginate(page, limit)

          return {
            message_id: messageId,
            message: "success",
            data: {
              meta: paginatedEvents.getMeta(),
              data_events: paginatedEvents.all().map(event => this.toJSON(event))
            }
          }
        } catch (error: any) {
          throw new Error(`Error fetching event data: ${error.message}`)
        }
      },
      { tags: cacheTags, ttl: CacheService.CONFIGS.MEDIUM.ttl }
    )
  }

  /**
   * Get single event by ID with caching
   */
  async getEventById(eventId: string): Promise<EventData | null> {
    const cacheKey = CacheService.getEventCacheKey(eventId)
    const cacheTags = [...CacheService.CONFIGS.TAGS.EVENTS]

    return CacheService.remember(
      cacheKey,
      async () => {
        try {
          const event = await this.eventModel.find(eventId)
          return event ? this.toJSON(event) : null
        } catch (error) {
          console.error(`Error fetching event ${eventId}:`, error)
          return null
        }
      },
      { 
        tags: cacheTags, 
        ttl: CacheService.CONFIGS.MEDIUM.ttl }
    )
  }

  /**
   * Get single event by slug (public access)
   */
  async getEventBySlug(slug: string): Promise<EventData | null> {
    const cacheKey = `events:slug:${slug}`
    const cacheTags = [...CacheService.CONFIGS.TAGS.EVENTS, ...CacheService.CONFIGS.TAGS.PUBLIC]

    return CacheService.remember(
      cacheKey,
      async () => {
        try {
          const event = await this.eventModel.query()
            .where('slug', slug)
            .where('status', 'publish')
            .first()

          return event ? this.toJSON(event) : null
        } catch (error) {
          console.error(`Error fetching event by slug ${slug}:`, error)
          return null
        }
      },
      { tags: cacheTags, ttl: CacheService.CONFIGS.LONG.ttl }
    )
  }

  /**
   * Create new event with file upload
   */
  async createEvent(eventData: CreateEventData): Promise<{ success: boolean; data?: EventData; error?: string }> {
    const trx = await db.transaction()

    try {
      const event_id = randomUUID()

      // Handle file upload if banner is provided
      let bannerUrl: string | null = null
      if (eventData.banner) {
        const uploadResult = await FileUploadService.uploadFile(eventData.banner, {}, 'uploads/events')
        if (!uploadResult.success) {
          await trx.rollback()
          return { success: false, error: uploadResult.error }
        }
        bannerUrl = uploadResult.url || null
      }

      // Generate slug if not provided
      const slug = eventData.slug || this.generateSlug(eventData.title)

      // Check slug uniqueness
      const existingEvent = await this.eventModel.query({ client: trx }).where('slug', slug).first()
      if (existingEvent) {
        await trx.rollback()
        return { success: false, error: 'Slug already exists' }
      }

      // Create event
      const event = await this.eventModel.create({
        event_id: event_id,
        title: eventData.title,
        description: eventData.description || null,
        location: eventData.location,
        organizer_contact: eventData.organizer_contact,
        registrationStartAt: DateTime.fromISO(eventData.registration_start_at),
        registrationEndAt: DateTime.fromISO(eventData.registration_end_at),
        banner: bannerUrl,
        status: eventData.status || 'pending',
        slug: slug,
        owner_id: eventData.owner_id 
      }, { client: trx })

      await trx.commit()

      // Clear relevant caches
      await this.clearEventCaches()

      const eventDataResult = this.toJSON(event)
      return { success: true, data: eventDataResult }

    } catch (error: any) {
      await trx.rollback()
      console.error('Error creating event:', error)
      return { success: false, error: `Failed to create event: ${error.message}` }
    }
  }

  /**
   * Update existing event
   */
  async updateEvent(eventId: string, updateData: UpdateEventData): Promise<{ success: boolean; data?: EventData; error?: string }> {
    const trx = await db.transaction()

    try {
      const event = await this.eventModel.find(eventId, { client: trx })
      if (!event) {
        await trx.rollback()
        return { success: false, error: 'Event not found' }
      }

      // Handle banner update
      let bannerUrl = event.banner
      if (updateData.banner !== undefined) {
        if (updateData.banner === null) {
          // Remove existing banner
          if (event.banner) {
            await FileUploadService.deleteFile(event.banner)
          }
          bannerUrl = null
        } else if (updateData.banner) {
          // Upload new banner
          const uploadResult = await FileUploadService.uploadFile(updateData.banner, {}, 'uploads/events')
          if (!uploadResult.success) {
            await trx.rollback()
            return { success: false, error: uploadResult.error }
          }

          // Delete old banner if exists
          if (event.banner) {
            await FileUploadService.deleteFile(event.banner)
          }

          bannerUrl = uploadResult.url || null
        }
      }

      // Check slug uniqueness if being updated
      if (updateData.slug && updateData.slug !== event.slug) {
        const existingEvent = await this.eventModel.query({ client: trx })
          .where('slug', updateData.slug)
          .whereNot('event_id', eventId)
          .first()

        if (existingEvent) {
          await trx.rollback()
          return { success: false, error: 'Slug already exists' }
        }
      }

      // Update event
      event.merge({
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.location && { location: updateData.location }),
        ...(updateData.organizer_contact && { organizer_contact: updateData.organizer_contact }),
        ...(updateData.registration_start_at && { registrationStartAt: DateTime.fromISO(updateData.registration_start_at) }),
        ...(updateData.registration_end_at && { registrationEndAt: DateTime.fromISO(updateData.registration_end_at) }),
        ...(bannerUrl !== undefined && { banner: bannerUrl }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.slug && { slug: updateData.slug })
      })

      event.useTransaction(trx)
      await event.save()
      await trx.commit()

      // Clear relevant caches
      await this.clearEventCaches(eventId)

      const updatedEvent = await this.eventModel.find(eventId)
      const eventDataResult = updatedEvent ? this.toJSON(updatedEvent) : undefined

      return { success: true, data: eventDataResult }

    } catch ( error: any) {
      await trx.rollback()
      console.error(`Error updating event ${eventId}:`, error)
      return { success: false, error: `Failed to update event: ${error.message}` }
    }
  }

  /**
   * Delete/archive event
   */
  async deleteEvent(eventId: string, hardDelete: boolean = false): Promise<{ success: boolean; error?: string }> {
    const trx = await db.transaction()

    try {
      const event = await this.eventModel.find(eventId, { client: trx })
      if (!event) {
        await trx.rollback()
        return { success: false, error: 'Event not found' }
      }

      if (hardDelete) {
        // Hard delete - remove banner file and database record
        if (event.banner) {
          await FileUploadService.deleteFile(event.banner)
        }
        event.useTransaction(trx)
        await event.delete()

      } else {
        // Soft delete - just archive
        event.status = 'archived'
        event.useTransaction(trx)
        await event.save()
      }

      await trx.commit()

      // Clear relevant caches
      await this.clearEventCaches(eventId)

      return { success: true }

    } catch (error: any) {
      await trx.rollback()
      console.error(`Error deleting event ${eventId}:`, error)
      return { success: false, error: `Failed to delete event: ${error.message}` }
    }
  }

  /**
   * Get events by owner
   */
  async getEventsByOwner(ownerId: string, params: PaginationParams): Promise<PaginatedResponse<EventData>> {
    return this.getEventDataPublic({ ...params, owner_id: ownerId })
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return `${title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()}-${Date.now()}`
  }

  /**
   * Clear event-related caches
   */
  private async clearEventCaches(eventId?: string): Promise<void> {
    try {
      const tags = [...CacheService.CONFIGS.TAGS.EVENTS, ...CacheService.CONFIGS.TAGS.PUBLIC]

      if (eventId) {
        // Clear specific event cache
        await CacheService.delete(CacheService.getEventCacheKey(eventId))
      }

      // Clear all event list caches
      await CacheService.clearByTags(tags)
    } catch (error) {
      console.error('Error clearing event caches:', error)
    }
  }

  /**
   * Validate event data
   */
  validateEventData(data: Partial<CreateEventData | UpdateEventData>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (data.title && data.title.length < 3) {
      errors.push('Title must be at least 3 characters long')
    }

    if (data.location && data.location.length < 3) {
      errors.push('Location must be at least 3 characters long')
    }

    if (data.organizer_contact && !this.isValidContact(data.organizer_contact)) {
      errors.push('Invalid organizer contact format')
    }

    if (data.registration_start_at && data.registration_end_at) {
      const start = new Date(data.registration_start_at)
      const end = new Date(data.registration_end_at)

      if (start >= end) {
        errors.push('Registration end date must be after start date')
      }
    }

    if (data.status && !['pending', 'publish', 'archived'].includes(data.status)) {
      errors.push('Invalid status value')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate contact format (simple email or phone check)
   */
  private isValidContact(contact: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/

    return emailRegex.test(contact) || phoneRegex.test(contact.replace(/[\s\-\(\)]/g, ''))
  }

  /**
   * Get event statistics
   */
  async getEventStats(ownerId?: string): Promise<{
    total: number
    published: number
    pending: number
    archived: number
  }> {
    try {
      let query = this.eventModel.query()

      if (ownerId) {
        query = query.where('owner_id', ownerId)
      }

      const stats = await query
        .select(db.raw('status, COUNT(*) as count'))
        .groupBy('status')

      const result = {
        total: 0,
        published: 0,
        pending: 0,
        archived: 0
      }

      stats.forEach(stat => {
        const count = Number(stat.$extras.count)
        result.total += count

        switch (stat.status) {
          case 'publish':
            result.published = count
            break
          case 'pending':
            result.pending = count
            break
          case 'archived':
            result.archived = count
            break
        }
      })

      return result
    } catch (error) {
      console.error('Error getting event stats:', error)
      return { total: 0, published: 0, pending: 0, archived: 0 }
    }
  }
}