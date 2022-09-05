export const create = () => ([{
  version: 'ROOT',
  value: 'UNSET'
}])

const newId = () => Math.random().toString(36).slice(2)

export const set = (state, newValue) => ({
  version: newId(),
  value: newValue,
  supercedes: state.map(({version}) => version)
})

export const merge = (state, op) => {
  const result = state.filter(({version}) => (
    !op.supercedes.includes(version)
  ))
  result.push({
    version: op.version,
    value: op.value,
  })
  
  return result
}