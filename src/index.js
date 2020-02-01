// Original: https://github.com/chenglou/react-motion/tree/master/demos/demo8-draggable-list

import { render } from 'react-dom'
import React, { useRef } from 'react'
import clamp from 'lodash-es/clamp'
import swap from 'lodash-move'
import { useGesture } from 'react-use-gesture'
import { useSprings, animated, interpolate } from 'react-spring'
import './styles.css'

// Returns fitting styles for dragged/idle items
const fn = (order, down, originalIndex, curIndex, y, x) => index => {
  return down && index === originalIndex
    ? {
        y: curIndex % 2 ? (curIndex - 1) * 50 + y : curIndex * 50 + y,
        x: curIndex % 2 ? 350 + x : x,
        scale: 1.3,
        zIndex: '1',
        shadow: 15,
        immediate: n => n === 'y' || n === 'x' || n === 'zIndex'
      }
    : {
        y: order.indexOf(index) % 2 ? (order.indexOf(index) - 1) * 50 : order.indexOf(index) * 50,
        x: order.indexOf(index) % 2 ? 350 : 0,
        scale: 1,
        zIndex: '0',
        shadow: 1,
        immediate: false
      }
}

function DraggableList({ items }) {
  const order = useRef(items.map((_, index) => index)) // Store indicies as a local ref, this represents the item order
  const [springs, setSprings] = useSprings(items.length, fn(order.current)) // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const bind = useGesture(({ args: [originalIndex], down, delta: [x, y] }) => {
    const curIndex = order.current.indexOf(originalIndex)
    const curRow = clamp(
      Math.round((curIndex % 2 ? (curIndex - 1) * 50 + y : curIndex * 50 + y) / 100),
      0,
      items.length / 2
    )
    const curCol = clamp(Math.round((curIndex % 2 ? 350 + x : x) / 100), 0, 1)
    const newOrder = swap(order.current, curIndex, 2 * curRow + curCol)
    // const newOrder = swap(order.current, curIndex, curIndex)
    setSprings(fn(newOrder, down, originalIndex, curIndex, y, x)) // Feed springs new style data, they'll animate the view without causing a single render
    if (!down) order.current = newOrder
  })
  return (
    <div className="content" style={{ height: items.length * 100 }}>
      {springs.map((spring, i) => {
        const { zIndex, shadow, y, x, scale } = spring
        return (
          <animated.div
            {...bind(i)}
            key={i}
            style={{
              zIndex,
              boxShadow: shadow.interpolate(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
              transform: interpolate([x, y, scale], (x, y, s) => `translate3d(${x}px,${y}px,0) scale(${s})`)
            }}
            children={items[i]}
          />
        )
      })}
    </div>
  )
}

render(
  <DraggableList
    items={'Lorem ipsum dolor sit amet suit asdf asdf dfas asdf asdf asdf asdf asdf asdf asdf dasf asdf asdf asdf asdf afs asdf asdf asdf asdf asdf asdf'.split(
      ' '
    )}
  />,
  document.getElementById('root')
)
