// @ts-nocheck
import { Button, ButtonEnum } from '.'

/**
 * Placeholder blockchain button shown when demo mode is disabled.
 * We keep the same signature so existing form logic remains intact,
 * but the interactions are disabled until smart-contract support arrives.
 */
export const GameButton = ({ entryAmountNum }: { entryAmountNum: number }) => {
  return (
    <Button buttonType={ButtonEnum.PRIMARY_1} disabled type="button">
      Blockchain mode unavailable ({entryAmountNum} demo only)
    </Button>
  )
}

export default GameButton
