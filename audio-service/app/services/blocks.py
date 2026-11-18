"""Block layout for processing long audio without loading it all into memory."""
from collections.abc import Iterator


def iter_blocks(total: int, block: int, pad: int) -> Iterator[tuple[int, int, int, int]]:
    """Yield (lo, start, end, hi) for every block of a `total`-frame signal.

    [start, end) is the part of the output this block is responsible for.
    [lo, hi) is what must be read: the block plus up to `pad` frames of context
    on each side, so the noise filter sees surrounding audio and block edges
    don't produce audible seams. The [start, end) ranges tile [0, total)
    exactly, so the output length always equals the input length.
    """
    if block <= 0:
        raise ValueError("block must be positive")
    if pad < 0:
        raise ValueError("pad must not be negative")
    for start in range(0, total, block):
        end = min(start + block, total)
        yield max(0, start - pad), start, end, min(total, end + pad)
