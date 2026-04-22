from langchain_text_splitters import RecursiveCharacterTextSplitter

_DEFAULTS = {
    "web": {"chunk_size": 400, "overlap": 80},
    "pdf": {"chunk_size": 700, "overlap": 120},
}


def chunk_text(
    texto: str,
    chunk_size: int | None = None,
    overlap: int | None = None,
    tipo: str = "web",
) -> list[str]:
    defaults = _DEFAULTS.get(tipo, _DEFAULTS["web"])
    size = chunk_size if chunk_size is not None else defaults["chunk_size"]
    ovlp = overlap if overlap is not None else defaults["overlap"]

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=size,
        chunk_overlap=ovlp,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )
    chunks = splitter.split_text(texto)
    return [c.strip() for c in chunks if c.strip()]
