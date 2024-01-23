import { App } from "https://cdn.jsdelivr.net/npm/probot@latest/lib/index.js"
import { axios } from "https://cdn.jsdelivr.net/npm/axios@latest/dist/axios.min.js"

const app = new App()

// Made with Mistral 8x7b Instruct v0.1

app.on('pull_request.opened', async context => {
  const { payload } = context
  const { pull_request } = payload
  const { user } = pull_request

  if (user.login === 'interstellar-bot') {
    const { data } = await axios.get(`https://api.github.com/repos/${payload.repository.full_name}/contents/.github/workflows/update-dependencies.yml`)
    const workflow = Buffer.from(data.content, 'base64').toString()
    const { data: runs } = await axios.post(`https://api.github.com/repos/${payload.repository.full_name}/actions/runs`, {
      name: 'Updated dependencies',
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      inputs: {
        workflow: workflow
      }
    })

    const { data: workflowRun } = await axios.get(`https://api.github.com/repos/${payload.repository.full_name}/actions/runs/${runs.id}`)
    while (workflowRun.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const { data: workflowRun } = await axios.get(`https://api.github.com/repos/${payload.repository.full_name}/actions/runs/${runs.id}`)
    }

    await context.github.pulls.merge({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: pull_request.number
    })
  }
})

export default app
