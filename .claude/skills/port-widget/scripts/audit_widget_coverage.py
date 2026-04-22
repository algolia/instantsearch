#!/usr/bin/env python3

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Iterable


def pascal_case(widget: str) -> str:
    return "".join(part.capitalize() for part in widget.split("-"))


def detect_repo_root(start: Path, explicit_repo: str | None) -> Path:
    if explicit_repo:
        root = Path(explicit_repo).expanduser().resolve()
    else:
        try:
            output = subprocess.check_output(
                ["git", "rev-parse", "--show-toplevel"],
                cwd=start,
                stderr=subprocess.DEVNULL,
                text=True,
            ).strip()
            root = Path(output)
        except (OSError, subprocess.CalledProcessError):
            root = start.resolve()
            while root != root.parent:
                if (root / "packages" / "instantsearch.js").exists():
                    break
                root = root.parent
            else:
                raise SystemExit(
                    "Could not locate the InstantSearch repo. Use --repo /path/to/instantsearch."
                )

    if not (root / "packages" / "instantsearch.js").exists():
        raise SystemExit(f"{root} does not look like the InstantSearch repo.")

    return root


def exists_any(paths: Iterable[Path]) -> tuple[bool, str]:
    path_list = list(paths)
    for path in path_list:
        if path.exists():
            return True, str(path)

    return False, " | ".join(str(path) for path in path_list)


def file_contains(path: Path, needle: str) -> bool:
    if not path.exists():
        return False

    return needle in path.read_text()


def rel(root: Path, value: str) -> str:
    if " | " in value:
        return " | ".join(rel(root, item) for item in value.split(" | "))

    path = Path(value)
    try:
        return str(path.relative_to(root))
    except ValueError:
        return value


def build_rows(
    root: Path, widget: str
) -> tuple[str, list[tuple[str, bool, str]], list[str]]:
    pascal = pascal_case(widget)
    camel = pascal[0].lower() + pascal[1:]

    vue_component_paths = [
        root
        / "packages"
        / "vue-instantsearch"
        / "src"
        / "components"
        / f"{pascal}.vue",
        root / "packages" / "vue-instantsearch" / "src" / "components" / f"{pascal}.js",
    ]

    rows: list[tuple[str, bool, str]] = [
        (
            "connector",
            (
                root
                / "packages"
                / "instantsearch.js"
                / "src"
                / "connectors"
                / widget
                / f"connect{pascal}.ts"
            ).exists(),
            str(
                root
                / "packages"
                / "instantsearch.js"
                / "src"
                / "connectors"
                / widget
                / f"connect{pascal}.ts"
            ),
        ),
        (
            "js widget",
            (
                root
                / "packages"
                / "instantsearch.js"
                / "src"
                / "widgets"
                / widget
                / f"{widget}.tsx"
            ).exists(),
            str(
                root
                / "packages"
                / "instantsearch.js"
                / "src"
                / "widgets"
                / widget
                / f"{widget}.tsx"
            ),
        ),
        (
            "react hook",
            (
                root
                / "packages"
                / "react-instantsearch-core"
                / "src"
                / "connectors"
                / f"use{pascal}.ts"
            ).exists(),
            str(
                root
                / "packages"
                / "react-instantsearch-core"
                / "src"
                / "connectors"
                / f"use{pascal}.ts"
            ),
        ),
        (
            "react widget",
            (
                root
                / "packages"
                / "react-instantsearch"
                / "src"
                / "widgets"
                / f"{pascal}.tsx"
            ).exists(),
            str(
                root
                / "packages"
                / "react-instantsearch"
                / "src"
                / "widgets"
                / f"{pascal}.tsx"
            ),
        ),
        (
            "react ui",
            (
                root
                / "packages"
                / "react-instantsearch"
                / "src"
                / "ui"
                / f"{pascal}.tsx"
            ).exists(),
            str(
                root
                / "packages"
                / "react-instantsearch"
                / "src"
                / "ui"
                / f"{pascal}.tsx"
            ),
        ),
        ("vue component", *exists_any(vue_component_paths)),
        (
            "common widget tests",
            (root / "tests" / "common" / "widgets" / widget / "index.ts").exists(),
            str(root / "tests" / "common" / "widgets" / widget / "index.ts"),
        ),
        (
            "common connector tests",
            (root / "tests" / "common" / "connectors" / widget / "index.ts").exists(),
            str(root / "tests" / "common" / "connectors" / widget / "index.ts"),
        ),
        (
            "js connector export",
            file_contains(
                root
                / "packages"
                / "instantsearch.js"
                / "src"
                / "connectors"
                / "index.ts",
                f"connect{pascal}",
            ),
            "packages/instantsearch.js/src/connectors/index.ts",
        ),
        (
            "js widget export",
            file_contains(
                root / "packages" / "instantsearch.js" / "src" / "widgets" / "index.ts",
                f"./{widget}/{widget}",
            ),
            "packages/instantsearch.js/src/widgets/index.ts",
        ),
        (
            "react core export",
            file_contains(
                root / "packages" / "react-instantsearch-core" / "src" / "index.ts",
                f"./connectors/use{pascal}",
            ),
            "packages/react-instantsearch-core/src/index.ts",
        ),
        (
            "react widget export",
            file_contains(
                root
                / "packages"
                / "react-instantsearch"
                / "src"
                / "widgets"
                / "index.ts",
                f"./{pascal}",
            ),
            "packages/react-instantsearch/src/widgets/index.ts",
        ),
        (
            "vue widget export",
            file_contains(
                root / "packages" / "vue-instantsearch" / "src" / "widgets.js",
                f"./components/{pascal}",
            ),
            "packages/vue-instantsearch/src/widgets.js",
        ),
    ]

    notes: list[str] = []
    vue_widget_tests = (
        root
        / "packages"
        / "vue-instantsearch"
        / "src"
        / "__tests__"
        / "common-widgets.test.js"
    )
    unsupported_text = f"{pascal} is not supported in Vue InstantSearch"
    if file_contains(vue_widget_tests, unsupported_text):
        notes.append("Vue common widget tests still mark this widget as unsupported.")

    vue_connector_tests = (
        root
        / "packages"
        / "vue-instantsearch"
        / "src"
        / "__tests__"
        / "common-connectors.test.js"
    )
    if file_contains(vue_connector_tests, f"create{pascal}ConnectorTests: () => {{}}"):
        notes.append(
            "Vue common connector tests still use a placeholder setup for this connector."
        )

    if widget == "autocomplete":
        notes.append(
            "Autocomplete still uses EXPERIMENTAL exports in JavaScript and React."
        )
    if widget in {
        "related-products",
        "frequently-bought-together",
        "trending-items",
        "looking-similar",
        "filter-suggestions",
        "chat",
    }:
        notes.append(
            "Check getting-started and query-suggestions examples before adding this widget to the e-commerce apps."
        )

    return camel, rows, notes


def print_report(root: Path, widget: str) -> None:
    camel, rows, notes = build_rows(root, widget)
    print(f"Widget: {widget}")
    print(f"Widget type: ais.{camel}")

    for label, present, path in rows:
        status = "yes" if present else "no "
        print(f"  {label:<24} {status}  {rel(root, path)}")

    if notes:
        print("Notes:")
        for note in notes:
            print(f"  - {note}")


def discover_widgets(root: Path) -> list[str]:
    widgets_dir = root / "tests" / "common" / "widgets"
    return sorted(path.name for path in widgets_dir.iterdir() if path.is_dir())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit InstantSearch widget coverage across JavaScript, React, and Vue."
    )
    parser.add_argument(
        "widgets", nargs="*", help="Widget kebab names such as refinement-list"
    )
    parser.add_argument("--repo", help="Path to the InstantSearch monorepo")
    parser.add_argument(
        "--all",
        action="store_true",
        help="Audit every widget that has a shared widget test folder",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = detect_repo_root(Path.cwd(), args.repo)

    widgets = args.widgets
    if args.all:
        widgets = discover_widgets(root)

    if not widgets:
        raise SystemExit("Pass a widget name or use --all.")

    for index, widget in enumerate(widgets):
        if index:
            print()
        print_report(root, widget)

    return 0


if __name__ == "__main__":
    sys.exit(main())
