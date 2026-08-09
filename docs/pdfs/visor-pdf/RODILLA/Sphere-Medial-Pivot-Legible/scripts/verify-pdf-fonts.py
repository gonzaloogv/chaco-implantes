from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from pypdf import PdfReader


PROJECT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_PDF = PROJECT_DIR / "output" / "sphere-medial-pivot-folleto.pdf"
DEFAULT_REPORT = PROJECT_DIR / "output" / "font-verification-report.json"
FONT_STREAM_KEYS = ("/FontFile", "/FontFile2", "/FontFile3")


def resolve_object(value: Any) -> Any:
    return value.get_object() if hasattr(value, "get_object") else value


def font_descriptor(font: Any) -> Any | None:
    font = resolve_object(font)
    subtype = str(font.get("/Subtype", ""))
    if subtype == "/Type0":
        descendants = font.get("/DescendantFonts", [])
        if not descendants:
            return None
        descendant = resolve_object(descendants[0])
        return resolve_object(descendant.get("/FontDescriptor"))
    return resolve_object(font.get("/FontDescriptor"))


def inspect_font(name: str, reference: Any) -> dict[str, Any]:
    font = resolve_object(reference)
    subtype = str(font.get("/Subtype", ""))
    base_font = str(font.get("/BaseFont", name))
    descriptor = font_descriptor(font)
    embedded_streams = [key for key in FONT_STREAM_KEYS if descriptor and key in descriptor] if descriptor else []
    converted_to_glyphs = subtype == "/Type3"
    return {
        "resource": name,
        "baseFont": base_font,
        "subtype": subtype,
        "embeddedStreams": embedded_streams,
        "convertedToGlyphs": converted_to_glyphs,
        "embeddedOrConverted": bool(embedded_streams) or converted_to_glyphs,
    }


def iter_resource_fonts(resources: Any, prefix: str, visited_forms: set[int]) -> Any:
    resources = resolve_object(resources) or {}
    fonts = resolve_object(resources.get("/Font", {})) or {}
    for name, reference in fonts.items():
        yield f"{prefix}{name}", reference

    xobjects = resolve_object(resources.get("/XObject", {})) or {}
    for name, reference in xobjects.items():
        xobject = resolve_object(reference)
        if str(xobject.get("/Subtype", "")) != "/Form" or "/Resources" not in xobject:
            continue
        form_identity = getattr(reference, "idnum", None) or id(xobject)
        if form_identity in visited_forms:
            continue
        visited_forms.add(form_identity)
        yield from iter_resource_fonts(
            xobject.get("/Resources", {}),
            f"{prefix}{name}/",
            visited_forms,
        )


def verify_pdf_fonts(pdf_path: Path) -> dict[str, Any]:
    reader = PdfReader(pdf_path)
    fonts_by_identity: dict[tuple[int | None, str], dict[str, Any]] = {}
    for page_number, page in enumerate(reader.pages, start=1):
        resources = resolve_object(page.get("/Resources", {}))
        for name, reference in iter_resource_fonts(resources, f"page-{page_number}/", set()):
            identity = (getattr(reference, "idnum", None), str(resolve_object(reference).get("/BaseFont", name)))
            entry = fonts_by_identity.setdefault(identity, {**inspect_font(str(name), reference), "pages": []})
            entry["pages"].append(page_number)
    fonts = list(fonts_by_identity.values())
    errors = [f"{font['baseFont']} no está incorporada ni convertida a glifos" for font in fonts if not font["embeddedOrConverted"]]
    if not fonts:
        errors.append("No se encontraron recursos tipográficos en el PDF")
    return {"pdf": str(pdf_path), "pageCount": len(reader.pages), "fontCount": len(fonts), "fonts": fonts, "errors": errors, "passed": not errors}


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    pdf_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_PDF
    report_path = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else DEFAULT_REPORT
    report = verify_pdf_fonts(pdf_path)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
