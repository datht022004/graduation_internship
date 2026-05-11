export function createDocumentStruct(input = {}) {
    return {
        id: input.id ?? '',
        filename: input.filename ?? '',
        file_type: input.file_type ?? '',
        file_size: input.file_size ?? 0,
        chunk_count: input.chunk_count ?? 0,
        uploaded_at: input.uploaded_at ?? '',
    }
}
