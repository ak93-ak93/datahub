import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import DatasetSchema from '@datahub/data-models/entity/dataset/modules/schema';
import DatasetComplianceAnnotation from '@datahub/data-models/entity/dataset/modules/compliance-annotation';
import { filterAnnotationsToDatasetSchema } from '@datahub/data-models/entity/dataset/helpers/validators/compliance/schema';
import {
  generateDatasetSchemaFields,
  generateDatasetSchema
} from '@datahub/data-models/mirage-addon/test-helpers/datasets/schema';

module('Unit | Utility | entity/dataset/helpers/validators/schema', function(hooks): void {
  setupTest(hooks);

  test('filterAnnotationsToDatasetSchema', function(assert): void {
    const annotations: Array<DatasetComplianceAnnotation> = [];
    let schema = new DatasetSchema();

    const resultA = filterAnnotationsToDatasetSchema(annotations, schema);
    assert.ok(resultA, 'Blank case works without issues');

    schema = generateDatasetSchema(generateDatasetSchemaFields(['pokemon["name"]', 'type["string"]']));

    annotations.push(
      ...[
        new DatasetComplianceAnnotation(undefined, 'pokemon["name"]'),
        new DatasetComplianceAnnotation(undefined, 'type["string"]'),
        new DatasetComplianceAnnotation(undefined, 'pokemon["name"]')
      ]
    );

    const resultB = filterAnnotationsToDatasetSchema(annotations, schema);
    assert.equal(resultB.length, 3, 'Base case: annotations are not filtered when they match schema fields');

    annotations.push(
      ...[
        new DatasetComplianceAnnotation(undefined, 'type["string"]'),
        new DatasetComplianceAnnotation(undefined, 'pokemon["string"]')
      ]
    );

    const resultC = filterAnnotationsToDatasetSchema(annotations, schema);
    assert.equal(resultC.length, 4, 'Filters out the annotation that doesnt match schema');

    schema = generateDatasetSchema(generateDatasetSchemaFields(['pokemon["string"]', 'type["string"]']));

    const resultD = filterAnnotationsToDatasetSchema(annotations, schema);
    assert.equal(resultD.length, 3, 'Filters out annotations that do not match schema, after schema change');
  });
});
