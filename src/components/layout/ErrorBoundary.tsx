import { Component, type ReactNode } from "react";
import { ErrorState } from "../ui/States";

interface Props {
    children: ReactNode;
    /** שינוי במפתח (למשל מעבר עמוד) מאפס את השגיאה */
    resetKey: string;
}

interface State {
    hasError: boolean;
    resetKey: string;
}

/** תופס שגיאה בעמוד ומציג הודעה, במקום מסך לבן */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, resetKey: this.props.resetKey };

    static getDerivedStateFromError(): Partial<State> {
        return { hasError: true };
    }

    static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
        return props.resetKey !== state.resetKey ? { hasError: false, resetKey: props.resetKey } : null;
    }

    render() {
        if (this.state.hasError) {
            return <ErrorState message="משהו השתבש בעמוד הזה" onRetry={() => window.location.reload()} />;
        }
        return this.props.children;
    }
}
