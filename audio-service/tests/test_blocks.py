import pytest

from app.services.blocks import iter_blocks


@pytest.mark.parametrize("total,block,pad", [
    (10, 3, 2), (9, 3, 2), (1, 5, 2), (100, 100, 10), (101, 100, 10), (5, 1, 0), (50, 7, 100),
])
def test_blocks_tile_the_signal_exactly(total, block, pad):
    parts = list(iter_blocks(total, block, pad))
    assert parts[0][1] == 0 and parts[-1][2] == total
    for (lo, start, end, hi), nxt in zip(parts, parts[1:] + [None]):
        assert 0 <= lo <= start < end <= hi <= total
        assert start - lo <= pad and hi - end <= pad
        if nxt:
            assert nxt[1] == end  # no gaps, no overlap in the kept ranges
    assert sum(e - s for _, s, e, _ in parts) == total


def test_invalid_arguments():
    with pytest.raises(ValueError):
        list(iter_blocks(10, 0, 1))
    with pytest.raises(ValueError):
        list(iter_blocks(10, 3, -1))
