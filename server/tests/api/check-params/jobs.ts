/* tslint:disable:no-unused-expression */

import 'mocha'

import {
  createUser,
  flushTests,
  killallServers,
  flushAndRunServer,
  ServerInfo,
  setAccessTokensToServers,
  userLogin,
  cleanupTests
} from '../../../../shared/extra-utils'
import {
  checkBadCountPagination,
  checkBadSortPagination,
  checkBadStartPagination
} from '../../../../shared/extra-utils/requests/check-api-params'
import { makeGetRequest } from '../../../../shared/extra-utils/requests/requests'

describe('Test jobs API validators', function () {
  const path = '/api/v1/jobs/failed'
  let server: ServerInfo
  let userAccessToken = ''

  // ---------------------------------------------------------------

  before(async function () {
    this.timeout(120000)

    server = await flushAndRunServer(1)

    await setAccessTokensToServers([ server ])

    const user = {
      username: 'user1',
      password: 'my super password'
    }
    await createUser({ url: server.url, accessToken: server.accessToken, username: user.username, password: user.password })
    userAccessToken = await userLogin(server, user)
  })

  describe('When listing jobs', function () {

    it('Should fail with a bad state', async function () {
      await makeGetRequest({
        url: server.url,
        token: server.accessToken,
        path: path + 'ade'
      })
    })

    it('Should fail with a bad start pagination', async function () {
      await checkBadStartPagination(server.url, path, server.accessToken)
    })

    it('Should fail with a bad count pagination', async function () {
      await checkBadCountPagination(server.url, path, server.accessToken)
    })

    it('Should fail with an incorrect sort', async function () {
      await checkBadSortPagination(server.url, path, server.accessToken)
    })

    it('Should fail with a non authenticated user', async function () {
      await makeGetRequest({
        url: server.url,
        path,
        statusCodeExpected: 401
      })
    })

    it('Should fail with a non admin user', async function () {
      await makeGetRequest({
        url: server.url,
        path,
        token: userAccessToken,
        statusCodeExpected: 403
      })
    })
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
