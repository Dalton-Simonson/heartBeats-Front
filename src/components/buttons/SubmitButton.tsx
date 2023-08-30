import { SubmitButton_AriaLabel, SubmitButton_Role } from "../../accessibility/Aria";
import { checkResponse, makeRequest } from "../../requests";
import {useState} from "react";

/**
 * Props for submit Button
 * data - selection data to send to backend
 */
interface SubmitButtonProps {
    userCode : String; // access code
    genres : String;
    playlist_type : String;
    desired_intensity : String;
    age : number;
    workout_length: number;
    isPersonalized: string;
    current_bpm: number;
    setResultsPage: (b : boolean) => void;
    setPlaylistID: (id : string | undefined) => void;
    setPlaylistType: (type: string) => void
}

interface ServerResponse{
    data: JSON
}

/**
 * Check if JSON is a server response
 * @param geoJSON - input JSON, type any
 */
export function isServerResponse(geoJSON: any) : geoJSON is ServerResponse {
    return geoJSON !== undefined;
}

let access_token : string | undefined = "";
let refresh_token : string | undefined = "";

/**
 * Submit button component. Handles sending data to the createPlaylist endpoint
 * and then redirect to the results page.
 * @param props data to submit
 * @constructor
 */
function SubmitButton(props: SubmitButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    // request timeout of 30 seconds

    // log information & make api call
    async function logInfo() {

        let raw_args = window.location.search;
        let params = new URLSearchParams(raw_args);

        if(access_token === "" && refresh_token === ""){

            const token_response : string | Map<string, string> =
                await checkResponse(await makeRequest("register-user-code?code=" + props.userCode))
            // const token_response : string | Map<string, string> =
            // await checkResponse(await makeRequest("register-user-code?code=" + params.get("code")))

            if (token_response instanceof Map) {
                access_token = token_response.get("access_token");
                refresh_token = token_response.get("refresh_token");
            }
        }

        let playlist_request: string ="generate-playlist?access_token=" + access_token
            + "&refresh_token=" + refresh_token
            + "&playlist_type=" + props.playlist_type
            + "&intensity=" + props.desired_intensity
            + "&genres=" + props.genres
            + "&age=" + props.current_bpm
            + "&workout_length=" + props.workout_length
            + "&is_personalized=" + props.isPersonalized

        console.log(props.playlist_type)

        // reset playlist id
        props.setPlaylistID("");

        // try to get response & if that doesn't work, give an alert
        try {
            const playlist_response: string | Map<string, string> =
                await checkResponse(await makeRequest(playlist_request))
            console.log(playlist_request)

            let playlist_id : string | undefined

            if (playlist_response instanceof Map) {
                playlist_id = playlist_response.get("playlist_id");

                props.setPlaylistID(playlist_id)

                // Redirect to result page
                props.setResultsPage(true);
            } else {
                console.log("request failed...");
                window.alert("Sorry, we could not find enough songs to create this playlist! Consider adding another genre or using your liked songs.")
            }
        } catch (error) {
            console.log("request failed...");
            window.alert("Sorry, we could not find enough songs to create this playlist! Consider adding another genre or using your liked songs.")
        }
    }

    async function handleSubmit() {
        await setIsLoading(true);
        console.log('beginning handleSubmit...' + isLoading);
        await logInfo();
        await setIsLoading(false);
        console.log('ending handleSubmit...' + isLoading);
    }

    // return component!
    return (
        <button className="formSubmitButton" role={SubmitButton_Role} aria-label={SubmitButton_AriaLabel} tabIndex={0} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Submit'}
        </button>
    )
}

export { SubmitButton }