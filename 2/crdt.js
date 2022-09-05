export const create = () => ({
  seq: 0,
  value: 0
})

export const set = (state, newValue) => ({
  seq: state.seq + 1,
  value: newValue
})

export const merge = (a, b) => {
  if (a.seq > b.seq
    || (a.seq === b.seq && a.value > b.value)) return a
  else return b
}