# Kiro Crew dynamic workflow, authored by Crew's workflow_author on 2026-11-12.
# Run with workflow_run(source=<this file>) from a Crew chat after every batch of fixes.
# Phases: screenshots (1440 and 390 px) -> design review + licence audit (read-only, parallel)
#         -> submission-check + offline-check (parallel) -> one gated report.
META = {"name": "awari-post-batch-verification", "description": "Retake Awari screenshots at 1440/390, run design and licence reviewers read-only in parallel, run submission-check and offline-check, return one gated report", "phases": ["screenshots", "review", "gates", "report"]}

REPO = "/Users/mac/workplace/awari"

SAFETY = (
    "Repo: " + REPO + ". Strict constraints: do NOT git push, deploy, run terraform apply, "
    "or spend money/call paid services. Do not read or print secrets or .env values. "
    "Only modify files explicitly stated in this task."
)

SHOT_SCHEMA = {
    "type": "object",
    "properties": {
        "ok": {"type": "boolean"},
        "widths_captured": {"type": "array", "items": {"type": "integer"}},
        "files": {"type": "array", "items": {"type": "string"}},
        "command": {"type": "string"},
        "notes": {"type": "string"},
    },
    "required": ["ok", "files", "notes"],
}

REVIEW_SCHEMA = {
    "type": "object",
    "properties": {
        "pass": {"type": "boolean"},
        "summary": {"type": "string"},
        "findings": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["pass", "summary", "findings"],
}

GATE_SCHEMA = {
    "type": "object",
    "properties": {
        "command": {"type": "string"},
        "exit_code": {"type": "integer"},
        "pass": {"type": "boolean"},
        "summary": {"type": "string"},
        "output_tail": {"type": "string"},
    },
    "required": ["command", "exit_code", "pass", "summary"],
}


def as_dict(x):
    return x if isinstance(x, dict) else {}


async def workflow(ctx):
    failures = []

    ctx.phase("screenshots")
    shots = await ctx.agent(
        SAFETY + "\n\nRetake the docs/screenshots for the Awari app at two viewport widths: "
        "1440 px (desktop) and 390 px (mobile). Inspect the repo (package.json scripts, docs/, "
        "any screenshot script or Playwright config) to find the existing screenshot mechanism and "
        "reuse it. Run the app locally bound to 127.0.0.1 only if needed, overwrite the existing "
        "screenshots in docs/screenshots following the existing naming convention, and stop any "
        "server you started. Report which widths were captured and the files written. "
        "Set ok=false if either width failed or was skipped.",
        schema=SHOT_SCHEMA,
        label="screenshots:1440+390",
        phase="screenshots",
    )
    shots_d = as_dict(shots)
    widths = shots_d.get("widths_captured", [])
    shots_ok = bool(shots_d.get("ok", False)) and (1440 in widths) and (390 in widths)
    if not shots_ok:
        failures.append("screenshots: failed or missing 1440/390 captures")

    ctx.phase("review")
    reviews = await ctx.parallel([
        ctx.agent(
            SAFETY + "\n\nRun the awari-design-reviewer agent in READ-ONLY mode against the repo and "
            "the freshly retaken screenshots (1440 and 390 px). Do not edit any files. Report pass/fail, "
            "a summary, and concrete findings.",
            schema=REVIEW_SCHEMA,
            label="review:awari-design-reviewer",
            phase="review",
        ),
        ctx.agent(
            SAFETY + "\n\nRun the awari-licence-auditor agent in READ-ONLY mode against the repo "
            "(dependencies, assets, fonts, images). Do not edit any files. Report pass/fail, "
            "a summary, and concrete findings.",
            schema=REVIEW_SCHEMA,
            label="review:awari-licence-auditor",
            phase="review",
        ),
    ])
    reviews = reviews if isinstance(reviews, list) else []
    design = as_dict(reviews[0]) if len(reviews) > 0 else {}
    licence = as_dict(reviews[1]) if len(reviews) > 1 else {}
    if not design:
        failures.append("design-reviewer: no result")
    elif not design.get("pass", False):
        failures.append("design-reviewer: reported failure")
    if not licence:
        failures.append("licence-auditor: no result")
    elif not licence.get("pass", False):
        failures.append("licence-auditor: reported failure")

    ctx.phase("gates")
    gates = await ctx.parallel([
        ctx.agent(
            SAFETY + "\n\nIn " + REPO + " run `npm run submission-check` and report the exact exit code, "
            "pass/fail, a short summary and the last ~30 lines of output. Do not fix or modify anything.",
            schema=GATE_SCHEMA,
            label="gate:submission-check",
            phase="gates",
        ),
        ctx.agent(
            SAFETY + "\n\nIn " + REPO + " run `npm run offline-check` and report the exact exit code, "
            "pass/fail, a short summary and the last ~30 lines of output. Do not fix or modify anything.",
            schema=GATE_SCHEMA,
            label="gate:offline-check",
            phase="gates",
        ),
    ])
    gates = gates if isinstance(gates, list) else []
    sub = as_dict(gates[0]) if len(gates) > 0 else {}
    off = as_dict(gates[1]) if len(gates) > 1 else {}
    if not sub:
        failures.append("submission-check: no result")
    elif not (sub.get("pass", False) and sub.get("exit_code", 1) == 0):
        failures.append("submission-check: failed (exit " + str(sub.get("exit_code", "?")) + ")")
    if not off:
        failures.append("offline-check: no result")
    elif not (off.get("pass", False) and off.get("exit_code", 1) == 0):
        failures.append("offline-check: failed (exit " + str(off.get("exit_code", "?")) + ")")

    ctx.phase("report")
    passed = len(failures) == 0
    ctx.log("verification " + ("PASSED" if passed else "FAILED: " + "; ".join(failures)))

    report = {
        "status": "pass" if passed else "fail",
        "repo": REPO,
        "failures": failures,
        "screenshots": shots_d,
        "design_review": design,
        "licence_audit": licence,
        "submission_check": sub,
        "offline_check": off,
        "finished_at": str(ctx.now),
    }
    if not passed:
        raise RuntimeError("Awari post-batch verification failed: " + "; ".join(failures) + " | report=" + repr(report))
    return report
