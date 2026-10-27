export function ProductCard({ product, purchased, disabled, disabledReason, onBuy }) {
  return (
    <article className="card">
      <img src={product.image} alt={product.name} className="card-image" />
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        <div className="card-footer">
          <span className="price">{product.price} USDC</span>
          {purchased ? (
            <a className="button button-success" href={product.image} download={`${product.id}.svg`}>
              Download
            </a>
          ) : (
            <button
              className="button"
              disabled={disabled}
              title={disabledReason}
              onClick={() => onBuy(product)}
            >
              Buy
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
