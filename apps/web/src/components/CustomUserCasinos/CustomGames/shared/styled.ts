// @ts-nocheck
import { styled } from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: 100%;
  position: relative;
  z-index: 1;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`

export const OrderListItems = styled.ol`
  margin-top: 0;
  padding-left: 24px;
`

export const UnorderListItems = styled.ul`
  margin-top: 0;
  padding-left: 24px;
  list-style: square;
`
