#!/usr/bin/env python3

"""Audit InstantSearch widget coverage across JavaScript, React, and Vue.

Usage:
    audit_widget_coverage.py <widget> [<widget> ...]
    audit_widget_coverage.py --all
    audit_widget_coverage.py --gaps      # only widgets with missing artifacts
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable


# Widgets that reuse another widget's connector/hook.
# A variant's connector and hook entries are expected to be absent.
VARIANTS: dict[str, str] = {
    "menu-select": "menu",        # uses connectMenu / useMenu
    "range-input": "range",       # uses connectRange / useRange
    "range-slider": "range",      # JS-only widget that uses connectRange
}

# Widgets that don't follow the normal widget layout. Skipped by --gaps.
SPECIAL: dict[str, str] = {
    "instantsearch": (
        "Root provider widget. Lives in core packages and bootstraps the app — "
        "not a normal widget to port."
    ),
    "dynamic-widgets": (
        "React component lives in `react-instantsearch-core/src/components/DynamicWidgets.tsx`, "
        "not in `react-instantsearch/src/widgets/`."
    ),
}

# Vue placeholder names that don't match `PascalCase(widget)`.
# Map widget kebab name -> placeholder string used in
# `packages/vue-instantsearch/src/__tests__/common-widgets.test.js`.
VUE_WIDGET_PLACEHOLDER_NAMES: dict[str, str] = {
    "related-products": "RelatedProduct",  # singular in the placeholder
}

# Vue widgets known to ship as `.js` render-function wrappers around a shared
# UI factory rather than `.vue` SFCs. Useful as precedents when porting newer
# recommendation/chat widgets.
VUE_RENDER_FUNCTION_PRECEDENTS = ("Hits.js", "Highlighter.js", "DynamicWidgets.js", "Feeds.js")


def pascal_case(widget: str) -> str:
    return "".join(part.capitalize() for part in widget.split("-"))


def camel_case(widget: str) -> str:
    pascal = pascal_case(widget)
    return pascal[0].lower() + pascal[1:]


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


def file_matches(path: Path, pattern: re.Pattern[str]) -> bool:
    if not path.exists():
        return False

    return bool(pattern.search(path.read_text()))


def rel(root: Path, value: str) -> str:
    if " | " in value:
        return " | ".join(rel(root, item) for item in value.split(" | "))

    path = Path(value)
    try:
        return str(path.relative_to(root))
    except ValueError:
        return value


def js_widget_paths(root: Path, widget: str) -> list[Path]:
    """JS widgets can be either .tsx (most) or .ts (dynamic-widgets)."""
    base = root / "packages" / "instantsearch.js" / "src" / "widgets" / widget
    return [base / f"{widget}.tsx", base / f"{widget}.ts"]


def vue_component_paths(root: Path, widget: str) -> list[Path]:
    base = root / "packages" / "vue-instantsearch" / "src" / "components"
    pascal = pascal_case(widget)
    return [base / f"{pascal}.vue", base / f"{pascal}.js"]


def build_rows(
    root: Path, widget: str
) -> tuple[str, list[tuple[str, bool, str]], list[str]]:
    pascal = pascal_case(widget)
    camel = camel_case(widget)
    variant_of = VARIANTS.get(widget)

    if variant_of:
        connector_owner = variant_of
        hook_owner = variant_of
    else:
        connector_owner = widget
        hook_owner = widget

    connector_pascal = pascal_case(connector_owner)
    connector_path = (
        root
        / "packages"
        / "instantsearch.js"
        / "src"
        / "connectors"
        / connector_owner
        / f"connect{connector_pascal}.ts"
    )
    hook_path = (
        root
        / "packages"
        / "react-instantsearch-core"
        / "src"
        / "connectors"
        / f"use{connector_pascal}.ts"
    )

    js_present, js_path = exists_any(js_widget_paths(root, widget))
    vue_present, vue_path = exists_any(vue_component_paths(root, widget))

    rows: list[tuple[str, bool, str]] = [
        ("connector", connector_path.exists(), str(connector_path)),
        ("js widget", js_present, js_path),
        ("react hook", hook_path.exists(), str(hook_path)),
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
        ("vue component", vue_present, vue_path),
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
                root / "packages" / "instantsearch.js" / "src" / "connectors" / "index.ts",
                f"connect{connector_pascal}",
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
                f"./connectors/use{connector_pascal}",
            ),
            "packages/react-instantsearch-core/src/index.ts",
        ),
        (
            "react widget export",
            file_matches(
                root / "packages" / "react-instantsearch" / "src" / "widgets" / "index.ts",
                re.compile(rf"['\"]\./{pascal}['\"]"),
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

    if variant_of:
        notes.append(
            f"Variant of `{variant_of}`: reuses `connect{connector_pascal}` and "
            f"`use{connector_pascal}`. Skip connector/hook creation and set "
            f"`$$widgetType: 'ais.{camel}'`."
        )

    if widget in SPECIAL:
        notes.append(f"Special widget: {SPECIAL[widget]}")

    vue_widget_tests = (
        root
        / "packages"
        / "vue-instantsearch"
        / "src"
        / "__tests__"
        / "common-widgets.test.js"
    )
    placeholder_name = VUE_WIDGET_PLACEHOLDER_NAMES.get(widget, pascal)
    placeholder_text = f"{placeholder_name} is not supported in Vue InstantSearch"
    if file_contains(vue_widget_tests, placeholder_text):
        notes.append(
            f"Vue common widget tests still throw `\"{placeholder_text}\"`. "
            "Replace the placeholder with real setup code."
        )

    vue_connector_tests = (
        root
        / "packages"
        / "vue-instantsearch"
        / "src"
        / "__tests__"
        / "common-connectors.test.js"
    )
    connector_placeholder = f"create{pascal}ConnectorTests: () => {{}}"
    if file_contains(vue_connector_tests, connector_placeholder):
        notes.append(
            f"Vue common connector tests still stub `{connector_placeholder}`."
        )

    if widget == "autocomplete":
        notes.append(
            "Autocomplete still uses EXPERIMENTAL exports in JavaScript and React."
        )
    if widget in {
        "related-products",
        "frequently-bought-together",
        "trending-items",
        "trending-facets",
        "looking-similar",
        "filter-suggestions",
        "chat",
    }:
        notes.append(
            "Recommendation/chat family — when porting to Vue, follow the "
            "`Hits.js` render-function precedent rather than a `.vue` SFC. "
            "Check getting-started and query-suggestions examples before adding to e-commerce apps."
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


def gap_summary(root: Path, widget: str) -> dict | None:
    """Return a dict describing this widget's gaps, or None if fully covered.

    Suppresses gaps that are expected: variant widgets (connector/hook live
    elsewhere), special widgets that don't follow the layout, and missing
    `react ui` files (only required for some widgets, not all).
    """
    if widget in SPECIAL:
        return None

    _, rows, notes = build_rows(root, widget)
    row_map = {label: present for label, present, _ in rows}
    is_variant = widget in VARIANTS

    # Ignored rows: optional or layout-dependent
    optional_rows = {"react ui"}

    # Variants intentionally skip these rows
    if is_variant:
        optional_rows |= {
            "connector",
            "react hook",
            "common connector tests",
            "js connector export",
            "react core export",
        }

    missing_flavors = {}
    if not row_map["js widget"] or not row_map["js widget export"]:
        missing_flavors["js"] = []
        if not row_map["js widget"]:
            missing_flavors["js"].append("widget file")
        if not row_map["js widget export"]:
            missing_flavors["js"].append("widget export")
        if not is_variant and not row_map["connector"]:
            missing_flavors["js"].append("connector file")
        if not is_variant and not row_map["js connector export"]:
            missing_flavors["js"].append("connector export")

    react_missing = []
    if not is_variant and not row_map["react hook"]:
        react_missing.append("hook")
    if not is_variant and not row_map["react core export"]:
        react_missing.append("hook export")
    if not row_map["react widget"]:
        react_missing.append("widget")
    if not row_map["react widget export"]:
        react_missing.append("widget export")
    if react_missing:
        missing_flavors["react"] = react_missing

    vue_missing = []
    if not row_map["vue component"]:
        vue_missing.append("component")
    if not row_map["vue widget export"]:
        vue_missing.append("export")
    if any("common widget tests still throw" in note for note in notes):
        vue_missing.append("widget test placeholder")
    if any("common connector tests still stub" in note for note in notes):
        vue_missing.append("connector test placeholder")
    if vue_missing:
        missing_flavors["vue"] = vue_missing

    common_tests_missing = []
    if not row_map["common widget tests"]:
        common_tests_missing.append("widget suite")
    if "common connector tests" not in optional_rows and not row_map["common connector tests"]:
        common_tests_missing.append("connector suite")
    if common_tests_missing:
        missing_flavors["tests/common"] = common_tests_missing

    if not missing_flavors:
        return None

    return {
        "widget": widget,
        "variant_of": VARIANTS.get(widget),
        "missing": missing_flavors,
        "notes": notes,
    }


def print_gaps(root: Path, widgets: list[str]) -> None:
    summaries = [g for g in (gap_summary(root, w) for w in widgets) if g]

    if not summaries:
        print("No gaps found — every audited widget is fully covered.")
        return

    # A widget can have implementation gaps (js/react/vue) and/or test-suite
    # gaps (tests/common). Sort into porting work vs test-only follow-ups.
    react_only = []
    vue_only = []
    js_only = []
    multi_impl = []
    tests_only = []
    for s in summaries:
        impl_flavors = set(s["missing"].keys()) - {"tests/common"}
        if not impl_flavors:
            tests_only.append(s)
            continue
        if impl_flavors == {"react"}:
            react_only.append(s)
        elif impl_flavors == {"vue"}:
            vue_only.append(s)
        elif impl_flavors == {"js"}:
            js_only.append(s)
        else:
            multi_impl.append(s)

    def section(title: str, group: list[dict]) -> None:
        if not group:
            return
        header = f"{title} ({len(group)})"
        print(f"\n{header}")
        print("-" * len(header))
        for s in group:
            variant = f" [variant of {s['variant_of']}]" if s["variant_of"] else ""
            print(f"  {s['widget']}{variant}")
            for flavor, items in s["missing"].items():
                print(f"    {flavor}: {', '.join(items)}")

    impl_count = len(react_only) + len(vue_only) + len(js_only) + len(multi_impl)
    print(f"Gaps found in {len(summaries)} widget(s) ({impl_count} need porting work).")
    section("React gaps", react_only)
    section("Vue gaps", vue_only)
    section("JS gaps", js_only)
    section("Multi-flavor gaps", multi_impl)
    section("Test-suite-only gaps (low priority)", tests_only)

    print("\nNext steps:")
    print("  - Run `audit_widget_coverage.py <widget>` for the full per-widget report.")
    print("  - Open `.claude/skills/port-widget/SKILL.md` for the porting workflow.")


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
    parser.add_argument(
        "--gaps",
        action="store_true",
        help="Only report widgets with missing artifacts. Implies --all when no widgets are given.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = detect_repo_root(Path.cwd(), args.repo)

    widgets = args.widgets
    if args.all or (args.gaps and not widgets):
        widgets = discover_widgets(root)

    if not widgets:
        raise SystemExit("Pass a widget name, --all, or --gaps.")

    if args.gaps:
        print_gaps(root, widgets)
        return 0

    for index, widget in enumerate(widgets):
        if index:
            print()
        print_report(root, widget)

    return 0


if __name__ == "__main__":
    sys.exit(main())
