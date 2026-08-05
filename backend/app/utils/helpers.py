def chunk_list(items: list, size: int) -> list[list]:
    return [items[index:index + size] for index in range(0, len(items), size)]
