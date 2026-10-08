// posição do exemplo no Scenario Outline (1, 2, 3...), contando todos os blocos Examples
function exampleNumber(gherkinDocument, pickle) {
    const [scenarioId, rowId] = pickle.astNodeIds;
    if (!rowId) return null;
    const children = gherkinDocument.feature.children.flatMap(c => (c.rule ? c.rule.children : [c]));
    const scenario = children.find(c => c.scenario?.id === scenarioId)?.scenario;
    const rows = scenario ? scenario.examples.flatMap(e => e.tableBody) : [];
    const index = rows.findIndex(r => r.id === rowId);
    return index === -1 ? null : index + 1;
}

// "CT-24" ou "CT-24-ex3", usado no nome das evidências
function scenarioId(gherkinDocument, pickle) {
    const ctTag = pickle.tags.map(t => t.name).find(t => /^@CT-\d+$/i.test(t));
    const baseId = ctTag
        ? ctTag.slice(1).toUpperCase()
        : pickle.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\W+/g, '-').toLowerCase();
    const example = exampleNumber(gherkinDocument, pickle);
    return example ? `${baseId}-ex${example}` : baseId;
}

function hasBugTag(pickle) {
    return pickle.tags.some(t => /^@bug-/i.test(t.name));
}

module.exports = { exampleNumber, scenarioId, hasBugTag };
