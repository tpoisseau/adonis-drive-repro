import { test } from '@japa/runner'
import drive from '@adonisjs/drive/services/main'

test.group('Drive', (group) => {
  group.each.setup(() => {
    drive.fake('fs')
    return () => drive.restore('fs')
  })

  test('drive get url', async ({ assert, client }) => {
    const fs = drive.use('fs')

    const fileKey = `82c8b73c-a74a-4a7b-9698-501dbd4dee44.json`

    const content = JSON.stringify({ foo: 'bar' })
    await fs.put(fileKey, content)

    const fileContent = await fs.get(fileKey)
    assert.equal(fileContent, content)

    // Next line generate this url: `/drive/fakes/82c8b73c-a74a-4a7b-9698-501dbd4dee44.json` which is wrong because the `routeBasePath` should be `/uploads`
    const url = await fs.getUrl(fileKey)

    const response = await client.get(url)

    // next lines throws

    // status 404
    response.assertOk()

    // E_ROUTE_NOT_FOUND
    // Cannot GET:/drive/fakes/82c8b73c-a74a-4a7b-9698-501dbd4dee44.json
    response.assertBodyContains({ foo: 'bar' }) // E_ROUTE_NOT_FOUND
  })

  test('manual url', async ({ assert, client }) => {
    const fs = drive.use('fs')

    const fileKey = `82c8b73c-a74a-4a7b-9698-501dbd4dee44.json`

    const content = JSON.stringify({ foo: 'bar' })
    await fs.put(fileKey, content)

    const fileContent = await fs.get(fileKey)
    assert.equal(fileContent, content)

    const url = `/uploads/${fileKey}`
    const response = await client.get(url)

    // next lines throws

    // status 404
    response.assertOk()

    // WARN (45931): ENOENT: no such file or directory, stat '/Users/tpoisseau/Projects/repro/adonis-drive-repro/storage/82c8b73c-a74a-4a7b-9698-501dbd4dee44.json'
    response.assertBodyContains({ foo: 'bar' }) // AssertionError: expected {} to contain subset { foo: 'bar' }
    // drive route handler use the real fs drive instead of the fake one
  })
})
