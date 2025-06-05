import React from "react";

const mockComponent = (type: string) => (props: any) =>
  React.createElement(type, props, props.children);

export const Document = mockComponent("Document");
export const Page = mockComponent("Page");
export const View = mockComponent("View");
export const Text = mockComponent("Text");
export const StyleSheet = {
  create: (styles: any) => styles,
};

export const pdf = jest.fn().mockReturnValue({
  toBlob: jest.fn(),
  toBuffer: jest.fn(),
  toString: jest.fn(),
});
