/** Fresh-process replay over the actual official Session serializer. */
import { Context } from '@deepseek-ai/cordis'
import { Session } from '@deepseek-ai/dsh-session'
import { FileReviewService } from '../../lib/index.js'
let input = ''
for await (const chunk of process.stdin) input += chunk
const { header, events, request } = JSON.parse(input)
const ctx = new Context(), service = new FileReviewService(ctx)
try {
  const agent = { id: header.id, session: Session.create(header.id, events, header), runMaintenance: fn => fn() }
  process.stdout.write(JSON.stringify(await service.apply(agent, request)))
} finally { await ctx.fiber.dispose() }
