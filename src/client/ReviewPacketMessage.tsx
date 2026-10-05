/** Delegate ordinary messages to the actual host renderer; only project known packets. */
import { useState, type ComponentType } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import { parseReviewPacket, REVIEW_PACKET_PACKAGE, type ParsedReviewPacket } from './review-comment-packet.ts'
import { t } from './locales.ts'
import { useReviewLocale } from './use-review-locale.ts'
import { useDiffViewPreferences } from './DiffViewControls.tsx'
import css from './ReviewComments.module.css'

type PacketMessageProps = ChatNodeViewProps<'user' | 'steering'>

function ReviewPacketDetails({ parsed }: { parsed: ParsedReviewPacket }) {
  const [notice, setNotice] = useState('')
  const copyOriginal = async () => {
    try {
      await navigator.clipboard.writeText(parsed.original)
      setNotice(t('copied'))
    } catch {
      setNotice(t('reviewCopyFailed'))
    }
  }
  return (
    <details className={css.packet} data-review-packet="">
      <summary>{t('reviewPacketCount', { count: parsed.packet.comments.length })}</summary>
      <pre className={css.packetText}>{parsed.packet.context}</pre>
      <button className={css.button} onClick={() => { void copyOriginal() }}>
        {t('reviewRawCopy')}
      </button>
      {notice && <small role="status">{notice}</small>}
    </details>
  )
}

function packetMessageView(Original: ComponentType<PacketMessageProps>) {
  return function ReviewPacketMessage(props: PacketMessageProps) {
    useReviewLocale()
    const preferences = useDiffViewPreferences()
    const content = props.node.data.content
    const first = content[0]
    const parsed = first?.type === 'text' ? parseReviewPacket(first.text) : null
    if (!parsed || !preferences.foldMessages) return <Original {...props} />
    // Project only the envelope text; preserve the native node identity, actions and attachments.
    const node = {
      ...props.node,
      data: {
        ...props.node.data,
        content: [{ type: 'text' as const, text: parsed.visibleText }, ...content.slice(1)],
      },
    } as typeof props.node
    const projectedProps = { ...props, node } as PacketMessageProps
    return (
      <>
        <ReviewPacketDetails key={parsed.packet.batchId} parsed={parsed} />
        <Original {...projectedProps} />
      </>
    )
  }
}

export function registerReviewPacketMessages(ctx: Context): () => void {
  const disposers: (() => void)[] = []
  for (const key of ['user', 'steering'] as const) {
    const original = ctx.slots.entriesOfSlot('conversation.chat.node').find(entry =>
      entry.options.key === key,
    )
    // Unknown host contracts retain their own renderer. No copied substitute.
    if (!original || original.inject || original.children || original.store) continue
    const Original = original.component as ComponentType<PacketMessageProps>
    disposers.push(ctx.slots.register({
      name: 'conversation.chat.node',
      key,
      priority: -20,
      locale: 'chat',
      registrant: `${REVIEW_PACKET_PACKAGE}:packet`,
    }, packetMessageView(Original)))
  }
  return () => {
    for (const dispose of disposers.reverse()) dispose()
  }
}
