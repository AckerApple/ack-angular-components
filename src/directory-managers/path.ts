export const path = {
  join: (...args: string[]) => {
    return args.filter(value => value.length).join('/')
  }
}
