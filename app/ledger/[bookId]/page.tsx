import { notFound } from "next/navigation"
import { LedgerBookGate } from "@/components/ledger-book-gate"
import { isLedgerBookId, type LedgerBookId } from "@/lib/data"

type Props = { params: Promise<{ bookId: string }> }

export default async function LedgerBookPage({ params }: Props) {
  const { bookId: raw } = await params
  if (!isLedgerBookId(raw)) notFound()
  const bookId = raw as LedgerBookId

  return <LedgerBookGate bookId={bookId} />
}
