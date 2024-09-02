export default {
    extends: ['@commitlint/cli', '@commitlint/config-conventional'],
    rules: {
        'type-enum': [2, 'always', ['Ci', 'Fix', 'Doc', 'Test', 'Build', 'Chore', 'Scale', 'Revert', 'Feature', 'Initial', 'Refactor', 'Optimized']],
        'subject-case': [2, 'always', 'sentence-case'],
        'type-case': [2, 'always', 'sentence-case']
    }
}

// "Initial": Used for initial setup.
// "Feature": For new features.
// "Fix": For bug fixes.
// "Doc": For documentation changes.
// "Scale": For scaling operations.
// "Refactor": For code refactoring.
// "Optimized": For optimizations.
// "Test": For adding or updating tests.
// "Build": For build-related changes.
// "Ci": For CI/CD changes.
// "Chore": For routine tasks like dependency updates.
// "Revert": For reverting previous changes.
