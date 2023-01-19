import * as styles from './fundings.css'

export const Fundings = (props: {
  totalPrice: string
  supporter: string
  status: string
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.itemMain}>
        <p className={styles.itemMainLabel}>累計販売金額</p>
        <p className={styles.itemMainText}>{props.totalPrice}</p>
      </div>
      <div className={styles.itemSub}>
        <p className={styles.itemSubLabel}>購入者数</p>
        <p className={styles.itemSubText}>{props.supporter}</p>
      </div>
      <div className={`${styles.itemSub} ${styles.itemSubBorder}`}>
        <p className={styles.itemSubLabel}>ステータス</p>
        <p className={styles.itemSubText}>{props.status}</p>
      </div>
    </div>
  )
}
