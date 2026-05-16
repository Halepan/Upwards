import type { Ref } from "vue";
import type { ISyncableRepository } from "../repository";

/* Store base abstracta que gestiona el estado reactivo de una entidad.
   Proporciona carga, listado y búsqueda por ID con manejo de errores. */
export abstract class BaseStore<T> {
    protected _items: Ref<T[]>;
    protected _isLoading: Ref<boolean>;
    protected _error: Ref<string | null>;
    protected abstract repository: ISyncableRepository<T>;

    constructor(items: Ref<T[]>, isLoading: Ref<boolean>, error: Ref<string | null>) {
        this._items = items
        this._isLoading = isLoading
        this._error = error
    }

    /* Carga todos los elementos desde el repositorio y actualiza el estado reactivo. */
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

    /* Busca un elemento por su ID numérico dentro de la lista en memoria. */
    getById(id: number): T | undefined {
        return this._items.value.find(item => (item as any).id === id)
    }
}
