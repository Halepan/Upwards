import { ref, type Ref } from 'vue'
import type { ISyncableRepository } from '../repository'
import type { ISyncEngine } from '../sync/isync_engine'
import type { BaseEntity } from '../lib/db'

/* Store base abstracta que gestiona el estado reactivo de una entidad.
   Proporciona operaciones CRUD completas con manejo de errores y loading.
   Cada subclase debe proveer el repositorio correspondiente. */
export abstract class BaseStore<T extends { id?: number; uuid: string }> {
  protected _items: Ref<T[]>
  protected _isLoading: Ref<boolean>
  protected _error: Ref<string | null>
  protected abstract repository: ISyncableRepository<T>
  protected _syncEngine?: ISyncEngine
  protected _tableName?: string // Nombre de la tabla para enqueue

  constructor() {
    this._items = ref<T[]>([]) as Ref<T[]>
    this._isLoading = ref(false)
    this._error = ref(null)
  }

  get items(): T[] {
    return this._items.value
  }

  get isLoading(): boolean {
    return this._isLoading.value
  }

  get error(): string | null {
    return this._error.value
  }

  /* Inyecta el motor de sincronización y el nombre de la tabla. */
  setSyncEngine(engine: ISyncEngine, tableName: string): void {
    this._syncEngine = engine
    this._tableName = tableName
  }

  /* Carga todos los elementos desde el repositorio. */
  async fetchAll(): Promise<void> {
    this._isLoading.value = true
    this._error.value = null
    try {
      this._items.value = await this.repository.findAll()
    } catch (cause) {
      this._error.value = cause instanceof Error ? cause.message : 'Error al cargar datos'
    } finally {
      this._isLoading.value = false
    }
  }

  /* Busca un elemento por ID dentro de la lista en memoria. */
  getById(id: number): T | undefined {
    return this._items.value.find(item => (item as any).id === id)
  }

  /* Busca un elemento por UUID dentro de la lista en memoria. */
  getByUuid(uuid: string): T | undefined {
    return this._items.value.find(item => (item as any).uuid === uuid)
  }

  /* Guarda (crea o actualiza) un elemento y actualiza el estado local. */
  async save(item: T): Promise<T> {
    this._error.value = null
    try {
      const saved = await this.repository.save(item)
      const index = this._items.value.findIndex(
        existing => (existing as any).id === (saved as any).id
      )
      if (index >= 0) {
        this._items.value[index] = saved
      } else {
        this._items.value.push(saved)
      }
      console.log(this._syncEngine , this._tableName)
      // 🔥 Encolar operación de sincronización
      console.log("delante de la condicional de basestore")
      if (this._syncEngine && this._tableName) {
        try {
          const operation = (item as any).id ? 'update' : 'create';
          await this._syncEngine.enqueue(operation, this._tableName, saved as any as BaseEntity);
        } catch (syncError) {
          console.warn('[BaseStore] Error al encolar operación:', syncError);
        }
      }else console.log("no entro porque " ,this._syncEngine, this._tableName)

      return saved
    } catch (cause) {
      this._error.value = cause instanceof Error ? cause.message : 'Error al guardar'
      throw cause
    }
  }

  /* Elimina un elemento por ID y lo remueve del estado local. */
  async deleteById(id: number): Promise<void> {
    this._error.value = null
    try {
      // Obtener el item antes de eliminarlo (para el payload de sync)
      const item = this.getById(id)
      await this.repository.delete(id)
      this._items.value = this._items.value.filter(
        item => (item as any).id !== id
      )

      // 🔥 Encolar operación de sincronización
      if (this._syncEngine && this._tableName && item) {
        await this._syncEngine.enqueue('delete', this._tableName, item as any as BaseEntity)
      }
    } catch (cause) {
      this._error.value = cause instanceof Error ? cause.message : 'Error al eliminar'
      throw cause
    }
  }

  /* Limpia el estado (items, error). */
  reset(): void {
    this._items.value = []
    this._error.value = null
    this._isLoading.value = false
  }
}