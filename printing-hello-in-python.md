# Printing Hello in Python

## Introduction

Python provides a simple, built-in `print()` function to display output to the console. Printing "Hello" is often the very first thing you learn when starting with Python.

## Basic Usage

```python
print("Hello")
```

Running this script outputs:

```
Hello
```

## Variations

### Print "Hello, World!"

```python
print("Hello, World!")
```

### Using Single Quotes

```python
print('Hello')
```

### Using Triple Quotes

```python
print("""Hello""")
```

### Printing to a Variable First

```python
message = "Hello"
print(message)
```

## Using f-strings (Python 3.6+)

```python
name = "World"
print(f"Hello, {name}!")
```

## Using `str.format()`

```python
name = "World"
print("Hello, {}!".format(name))
```

## Using String Concatenation

```python
greeting = "Hello"
name = "World"
print(greeting + ", " + name + "!")
```

## Python 2 vs Python 3

In Python 2, `print` was a statement rather than a function:

```python
# Python 2
print "Hello"

# Python 3
print("Hello")
```

Python 2 has reached end of life. Always use Python 3 and the `print()` function syntax.

## Summary

- Use `print("Hello")` to display text in Python.
- The `print()` function accepts strings, variables, and formatted expressions.
- Use f-strings for clean, readable string interpolation.
