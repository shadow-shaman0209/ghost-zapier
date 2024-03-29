const {initAdminApi, versionCheck} = require('../lib/utils');
const webhooks = require('../lib/webhooks');

const subscribeWebhook = async (z, bundle) => {
    // Newsletters was added in Ghost 5.0
    await versionCheck('>=5.0.0', 'newsletters', z, bundle);

    return webhooks.subscribe('newsletter.added', z, bundle);
};

const unsubscribeWebhook = async (z, bundle) => {
    // Newsletters was added in Ghost 5.0
    await versionCheck('>=5.0.0', 'newsletters', z, bundle);

    return webhooks.unsubscribe(z, bundle);
};

// triggers on newsletter.added. Formats the API response ready for passing to
// the zap which expects an array
const handleWebhook = (z, bundle) => {
    // bundle.cleanedRequest will include the parsed JSON object (if it's not a
    // test poll) and also a .querystring property with the URL's query string.
    const {newsletter} = bundle.cleanedRequest;

    return [newsletter.current];
};

const listNewsletters = async (z, bundle) => {
    // Newsletters was added in Ghost 5.0
    await versionCheck('>=5.0.0', 'newsletters', z, bundle);

    const {authData, meta} = bundle;

    const api = initAdminApi(z, authData);

    if (meta.isFillingDynamicDropdown) {
        return api.newsletters.browse({
            order: 'name DESC',
            limit: 'all'
        });
    }

    return api.newsletters.browse({
        order: 'created_at DESC',
        limit: 1
    });
};

module.exports = {
    key: 'newsletter_created',
    noun: 'Newsletter',

    display: {
        label: 'Newsletter Created',
        description: 'Triggers when a new newsletter is added.',
        hidden: true // only used by newsletter dynamic dropdown
    },

    operation: {
        inputFields: [],

        type: 'hook',

        performSubscribe: subscribeWebhook,
        performUnsubscribe: unsubscribeWebhook,

        perform: handleWebhook,
        performList: listNewsletters,

        sample: {
            id: '627be9e49278a3c9b09f8883',
            name: 'Default newsletter',
            description: 'Thoughts, stories and ideas.',
            slug: 'default-newsletter',
            sender_email: null,
            sender_reply_to: 'newsletter',
            status: 'active',
            visibility: 'members',
            subscribe_on_signup: true,
            sort_order: 0,
            header_image: null,
            show_header_icon: true,
            show_header_title: true,
            title_font_category: 'sans_serif',
            title_alignment: 'center',
            show_feature_image: true,
            body_font_category: 'sans_serif',
            footer_content: '',
            show_badge: true,
            sender_name: null,
            created_at: '2022-05-11T16:52:52.000Z',
            updated_at: null,
            show_header_name: false,
            uuid: 'c9e80472-8017-4abc-8bb0-6393f1b39596'
        }
    }
};
