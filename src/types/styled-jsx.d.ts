// Type declarations for styled-jsx (built into Next.js)
// This allows <style jsx> and <style jsx global> to compile without TypeScript errors.

import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
