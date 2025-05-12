import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { Bedrock } from "../Bedrock"
import { ApiConfiguration } from "@roo/shared/api"

// Mock the vscrui Checkbox component
jest.mock("vscrui", () => ({
	Checkbox: ({ children, checked, onChange }: any) => (
		<label data-testid={`checkbox-${children?.toString().replace(/\s+/g, "-").toLowerCase()}`}>
			<input
				type="checkbox"
				checked={checked}
				onChange={() => onChange(!checked)} // Toggle the checked state
				data-testid={`checkbox-input-${children?.toString().replace(/\s+/g, "-").toLowerCase()}`}
			/>
			{children}
		</label>
	),
}))

// Mock the VSCodeTextField component
jest.mock("@vscode/webview-ui-toolkit/react", () => ({
	VSCodeTextField: ({ children, value, onInput, placeholder, className, style }: any) => (
		<div data-testid="vscode-text-field" className={className} style={style}>
			{children}
			<input
				type="text"
				value={value}
				onChange={(e) => onInput && onInput(e)}
				placeholder={placeholder}
				data-testid="vpc-endpoint-input"
			/>
		</div>
	),
	VSCodeRadio: () => <div>Radio</div>,
	VSCodeRadioGroup: ({ children }: any) => <div>{children}</div>,
}))

// Mock the translation hook
jest.mock("@src/i18n/TranslationContext", () => ({
	useAppTranslation: () => ({
		t: (key: string) => key,
	}),
}))

// Mock the UI components
jest.mock("@src/components/ui", () => ({
	Select: ({ children }: any) => <div>{children}</div>,
	SelectContent: ({ children }: any) => <div>{children}</div>,
	SelectItem: () => <div>Item</div>,
	SelectTrigger: ({ children }: any) => <div>{children}</div>,
	SelectValue: () => <div>Value</div>,
}))

// Mock the constants
jest.mock("../../constants", () => ({
	AWS_REGIONS: [{ value: "us-east-1", label: "US East (N. Virginia)" }],
}))

describe("Bedrock Component", () => {
	const mockSetApiConfigurationField = jest.fn()

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it("should show text field when VPC endpoint checkbox is checked", () => {
		// Initial render with checkbox unchecked
		const apiConfiguration: Partial<ApiConfiguration> = {
			awsBedrockEndpoint: "",
		}

		render(
			<Bedrock
				apiConfiguration={apiConfiguration as ApiConfiguration}
				setApiConfigurationField={mockSetApiConfigurationField}
			/>,
		)

		// Text field should not be visible initially
		expect(screen.queryByTestId("vpc-endpoint-input")).not.toBeInTheDocument()

		// Click the checkbox
		fireEvent.click(screen.getByTestId("checkbox-input-use-custom-vpc-endpoint"))

		// Text field should now be visible
		expect(screen.getByTestId("vpc-endpoint-input")).toBeInTheDocument()
	})

	it("should hide text field when VPC endpoint checkbox is unchecked", () => {
		// Initial render with checkbox checked
		const apiConfiguration: Partial<ApiConfiguration> = {
			awsBedrockEndpoint: "https://example.com",
		}

		render(
			<Bedrock
				apiConfiguration={apiConfiguration as ApiConfiguration}
				setApiConfigurationField={mockSetApiConfigurationField}
			/>,
		)

		// Text field should be visible initially
		expect(screen.getByTestId("vpc-endpoint-input")).toBeInTheDocument()

		// Click the checkbox to uncheck it
		fireEvent.click(screen.getByTestId("checkbox-input-use-custom-vpc-endpoint"))

		// Text field should now be hidden
		expect(screen.queryByTestId("vpc-endpoint-input")).not.toBeInTheDocument()

		// Should call setApiConfigurationField to clear the endpoint
		expect(mockSetApiConfigurationField).toHaveBeenCalledWith("awsBedrockEndpoint", "")
	})
})
