import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "schemas" / "research_artifact.schema.json"
FIXTURE_DIR = ROOT / "website" / "data" / "fixtures" / "research_artifacts"


def load_json(path):
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def resolve_ref(schema, ref):
    prefix = "#/$defs/"
    assert ref.startswith(prefix), f"Unsupported schema ref: {ref}"
    return schema["$defs"][ref.removeprefix(prefix)]


def type_matches(value, expected_type):
    if expected_type == "object":
        return isinstance(value, dict)
    if expected_type == "array":
        return isinstance(value, list)
    if expected_type == "string":
        return isinstance(value, str)
    if expected_type == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if expected_type == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected_type == "boolean":
        return isinstance(value, bool)
    if expected_type == "null":
        return value is None
    raise AssertionError(f"Unsupported schema type: {expected_type}")


def assert_schema_subset(instance, schema_node, root_schema, path="$"):
    if "$ref" in schema_node:
        schema_node = resolve_ref(root_schema, schema_node["$ref"])

    expected_type = schema_node.get("type")
    if isinstance(expected_type, list):
        assert any(type_matches(instance, item) for item in expected_type), path
    elif expected_type is not None:
        assert type_matches(instance, expected_type), path

    if "const" in schema_node:
        assert instance == schema_node["const"], path

    if "enum" in schema_node:
        assert instance in schema_node["enum"], path

    if isinstance(instance, str):
        if "pattern" in schema_node:
            assert re.fullmatch(schema_node["pattern"], instance), path
        if "minLength" in schema_node:
            assert len(instance) >= schema_node["minLength"], path

    if isinstance(instance, (int, float)) and not isinstance(instance, bool):
        if "minimum" in schema_node:
            assert instance >= schema_node["minimum"], path
        if "maximum" in schema_node:
            assert instance <= schema_node["maximum"], path
        if "exclusiveMinimum" in schema_node:
            assert instance > schema_node["exclusiveMinimum"], path

    if isinstance(instance, list):
        if "minItems" in schema_node:
            assert len(instance) >= schema_node["minItems"], path
        if schema_node.get("uniqueItems"):
            assert len(instance) == len(set(instance)), path
        if "items" in schema_node:
            for index, item in enumerate(instance):
                assert_schema_subset(item, schema_node["items"], root_schema, f"{path}[{index}]")

    if isinstance(instance, dict):
        required = schema_node.get("required", [])
        for key in required:
            assert key in instance, f"{path}.{key}"

        properties = schema_node.get("properties", {})
        additional = schema_node.get("additionalProperties", True)
        if additional is False:
            extra = set(instance) - set(properties)
            assert not extra, f"{path} has unexpected keys: {sorted(extra)}"

        for key, value in instance.items():
            if key in properties:
                assert_schema_subset(value, properties[key], root_schema, f"{path}.{key}")
            elif isinstance(additional, dict):
                assert_schema_subset(value, additional, root_schema, f"{path}.{key}")


def iter_artifact_fixtures():
    return sorted(FIXTURE_DIR.glob("*.json"))


def test_research_artifact_schema_is_valid_json():
    schema = load_json(SCHEMA_PATH)

    assert schema["title"] == "Strategy Ledger Research Artifact"
    assert schema["properties"]["schema_version"]["const"] == "1.0.0"
    assert schema["additionalProperties"] is False


def test_artifact_fixtures_match_schema_subset():
    schema = load_json(SCHEMA_PATH)
    fixtures = iter_artifact_fixtures()

    assert fixtures, "Expected at least one research artifact fixture"
    for fixture_path in fixtures:
        artifact = load_json(fixture_path)
        assert_schema_subset(artifact, schema, schema, fixture_path.name)


def test_artifact_publication_invariants():
    for fixture_path in iter_artifact_fixtures():
        artifact = load_json(fixture_path)

        assert artifact["publication_state"] == artifact["content_review"]["stage"]
        assert artifact["backtest_run"]["sample_start"] <= artifact["backtest_run"]["sample_end"]

        for name, series in artifact["performance_series"].items():
            assert series, f"{fixture_path.name} {name} must not be empty"
            dates = [point["date"] for point in series]
            assert dates == sorted(dates), f"{fixture_path.name} {name} dates must be sorted"

        if artifact["publication_state"] == "published":
            assert artifact["content_review"]["quant_reviewer"]
            assert artifact["content_review"]["compliance_reviewer"]
            assert artifact["content_review"]["approved_at"]
            assert artifact["instrument"]["data_rights_status"] != "prototype_only"
            assert artifact["data_snapshot"]["license_scope"] != "prototype_only"
        else:
            assert artifact["artifact_id"].endswith("demo-2026-07-12")


def test_demo_fixture_is_not_accidentally_publishable():
    demo = load_json(FIXTURE_DIR / "spy_mean_reversion_demo.json")

    assert demo["publication_state"] == "draft"
    assert demo["instrument"]["data_rights_status"] == "prototype_only"
    assert demo["data_snapshot"]["license_scope"] == "prototype_only"
    assert demo["content_review"]["approved_at"] is None


if __name__ == "__main__":
    for name, function in sorted(globals().items()):
        if name.startswith("test_") and callable(function):
            function()
    print("research artifact contract test passed")
