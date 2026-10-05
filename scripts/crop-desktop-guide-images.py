"""Crop real Desktop captures for the guide; never generate or fabricate UI.

Usage: python scripts/crop-desktop-guide-images.py <capture-directory>
Requires Pillow. Raw captures stay outside the repository and installation package.
Each rectangle removes unrelated UI without altering the demonstrated controls.
"""

import sys
from pathlib import Path

from PIL import Image


# Source name, published name, and (left, top, right, bottom) in raw pixels.
CAPTURES = [
    ("01-file-review-overview", "01-file-review-overview", (0, 80, 1536, 460)),
    ("02-git-review-scope", "02-git-review-scope", (280, 80, 1536, 610)),
    ("03-multi-repository-settings", "03-multi-repository-settings", (280, 115, 930, 787)),
    ("04-unified-diff-context-controls", "04-unified-diff-context-controls", (0, 285, 1530, 790)),
    ("05-expanded-context-collapse", "05-expanded-context-collapse", (0, 285, 1530, 816)),
    ("06-search-and-navigation", "06-split-diff-search", (280, 275, 1530, 816)),
    ("07-selection-context-menu", "07-line-selection-context-menu", (0, 285, 1530, 816)),
    ("08-diff-appearance-settings", "08-diff-appearance-settings", (520, 0, 1016, 816)),
    ("09-external-editor-settings", "09-external-editor-settings", (520, 0, 1016, 816)),
    ("10-inline-review-comment", "10-range-comment-editor", (0, 285, 1530, 816)),
    ("11-pending-review-comments", "11-pending-review-comments", (0, 210, 1536, 355)),
    ("12-review-discussion-history", "12-review-discussion-history", (0, 80, 1536, 530)),
    ("13-review-enhancements-zh", "13-review-enhancements-zh", (280, 475, 955, 790)),
    ("14-review-enhancements-en", "14-review-enhancements-en", (280, 435, 955, 790)),
    ("15-profile-settings-zh", "15-profile-settings-zh", (320, 328, 1240, 585)),
    ("16-profile-settings-en", "16-profile-settings-en", (410, 328, 1400, 595)),
    ("17-review-packet-zh", "17-review-packet-zh", (130, 135, 830, 585)),
    ("18-review-packet-en", "18-review-packet-en", (180, 130, 825, 510)),
]


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    source = Path(sys.argv[1]).resolve(strict=True)
    target = Path(__file__).resolve().parent.parent / "docs" / "image"
    for raw_name, published_name, rectangle in CAPTURES:
        with Image.open(source / f"{raw_name}.png") as original:
            left, top, right, bottom = rectangle
            if not (0 <= left < right <= original.width and 0 <= top < bottom <= original.height):
                raise ValueError(f"Crop outside capture: {raw_name} {original.size}")
            image = original.convert("RGB").crop(rectangle)
            destination = target / f"{published_name}.jpg"
            image.save(destination, quality=93, subsampling=0, optimize=True)
            if destination.stat().st_size > 1024 * 1024:
                raise ValueError(f"Guide image exceeds 1 MiB: {destination}")
            print(f"{destination.name}: {image.width}x{image.height}")


if __name__ == "__main__":
    main()
