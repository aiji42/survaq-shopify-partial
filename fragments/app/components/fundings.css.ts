import { style } from '@vanilla-extract/css'

export const wrapper = style({
  display: 'grid',
  gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
  textAlign: 'center'
})

export const itemMain = style({
  gridColumn: 'span 2/span 2',
  padding: '0 1rem .5rem',
  borderBottom: '1px solid rgba(229,231,235,1)',
  marginBottom: '.25rem'
})

export const itemMainLabel = style({
  margin: 0,
  fontSize: '.75rem',
  lineHeight: '1.25rem',
  fontWeight: 750,
  color: '#686868'
})

export const itemMainText = style({
  paddingBottom: '.25rem',
  fontSize: '1.875rem',
  lineHeight: '2.1rem'
})

export const itemSub = style({
  gridColumn: 'span 1/span 1',
  padding: '.5rem 1rem 0'
})

export const itemSubBorder = style({
  borderLeft: '1px solid rgba(229,231,235,1)'
})

export const itemSubLabel = style({
  margin: '.25rem 0 0',
  fontSize: '.65rem',
  lineHeight: '1rem',
  fontWeight: 750,
  color: '#686868'
})

export const itemSubText = style({
  margin: 0,
  paddingBottom: '1.25rem',
  fontSize: '1.5rem',
  lineHeight: '2.1rem',
  fontWeight: 750,
  color: '#686868'
})

// .fundingWrapper {
//   display: grid;
//   grid-template-rows: repeat(2, minmax(0, 1fr));
//   text-align: center;
// }
// .fundingItem__main {
//   grid-column: span 2/span 2;
//   padding: 0 1rem .5rem;
//   border-bottom: 1px solid rgba(229,231,235,1);
//   margin-bottom: .25rem;
// }
// .fundingItem__main__label {
//   margin: 0;
//   font-size: .75rem;
//   line-height: 1.25rem;
//   font-weight: 750;
//   color: #686868;
// }
// .fundingItem__main__text {
//   padding-bottom: .25rem;
//   font-size: 1.875rem;
//   line-height: 2.1rem;
// }
// .fundingItem__sub {
//   grid-column: span 1/span 1;
//   padding: .5rem 1rem 0;
// }
// .fundingItem__sub__border {
//   border-left: 1px solid rgba(229,231,235,1);
// }
// .fundingItem__sub_label {
//   margin: .25rem 0 0;
//   font-size: .65rem;
//   line-height: 1rem;
//   font-weight: 750;
//   color: #686868;
// }
// .fundingItem__sub_text {
//   margin: 0;
//   font-size: 1.25rem;
//   line-height: 1.5rem;
//   font-weight: 750;
//   color: #686868;
// }
